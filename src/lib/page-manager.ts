// chrome-manager.ts
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import puppeteer, { Browser, Page, Target } from 'puppeteer';

// Type definitions
type ChromeParams = {
  path: string;
  args: string[];
  postSpawnDelay: number;
};

type PageEvaluationResult<T> = {
  success: boolean;
  data?: T;
  error?: Error;
};

type SafeEvaluateOptions = {
  retries?: number;
  delayMs?: number;
};

type PlatformConfig = Partial<Record<NodeJS.Platform, ChromeParams>> & {
    default: ChromeParams;
  };
  
// Default Chrome parameters
const DEFAULT_CHROME_PARAMS: PlatformConfig = {
    darwin: {
      path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222',
        '--remote-allow-origins=*',
        '-no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=' + path.resolve(__dirname, '../../Profile1'),
        '--profile-directory=Profile 1'
      ],
      postSpawnDelay: 5000
    },
    linux: {
      path: 'google-chrome',
      args: [
        '--no-sandbox',
        '--user-data-dir=' + process.env.HOME + '/.config/google-chrome', // Use default Chrome path
        '--profile-directory=Profile 1',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222',
        '--remote-allow-origins=*',
        '--no-first-run',
        '--no-default-browser-check',
      ],
      postSpawnDelay: 5000
    },
    win32: {
      path: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222'
      ],
      postSpawnDelay: 5000
    },
    default: {
      path: '', // Will throw error if used
      args: [],
      postSpawnDelay: 5000
    }
  };
  
class ChromeManager {
  private static instance: ChromeManager;
  private browser: Browser | null = null;
  private activePage: Page | null = null;
  private chromeProcess: ChildProcess | null = null;
  private mainUrl: string;
  private userAgent: string;

  private constructor(mainUrl: string, userAgent: string) {
    this.mainUrl = mainUrl;
    this.userAgent = userAgent;
  }

  public static async getInstance(
    mainUrl: string,
    userAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15'
  ): Promise<ChromeManager> {
    if (!ChromeManager.instance) {
      ChromeManager.instance = new ChromeManager(mainUrl, userAgent);
      await ChromeManager.instance.initialize();
    }
    return ChromeManager.instance;
  }

  private async initialize(): Promise<void> {
    this.browser = await this.connectOrLaunch();
    await this.setupPageHandling();
  }

  private async connectOrLaunch(): Promise<Browser> {
    try {
      // Try connecting to existing browser
      const browser = await puppeteer.connect({
        browserURL: 'http://127.0.0.1:9222',
        defaultViewport: null
      });
      return browser;
    } catch (error) {
      // Launch new instance if connection fails
      return this.launchChrome();
    }
  }

  private async launchChrome(): Promise<Browser> {
    const platform = process.platform as NodeJS.Platform;
    const params = DEFAULT_CHROME_PARAMS[platform] || DEFAULT_CHROME_PARAMS.default;

    this.chromeProcess = spawn(params.path, params.args, {
      stdio: 'ignore' // Adjust as needed for logging
    });

    await delay(params.postSpawnDelay);

    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    return browser;
  }

  private async setupPageHandling(): Promise<void> {
    if (!this.browser) throw new Error('Browser not initialized');

    // Handle new targets/pages
    this.browser.on('targetchanged', async (target: Target) => {
      if (target.type() === 'page') {
        const newPage = await target.page();
        if (newPage && newPage.url() === this.mainUrl) {
          this.activePage = newPage;
          await newPage.setUserAgent(this.userAgent);
        }
      }
    });
  }

  public async getActivePage(): Promise<Page> {
    if (!this.browser) throw new Error('Browser not initialized');
  
    // Instead of reusing a cached page, search for one with the desired URL
    const pages = await this.browser.pages();
    const targetPage = pages.find(p => p.url() === this.mainUrl);
  
    if (targetPage) {
      return targetPage;
    } else {
      const newPage = await this.browser.newPage();
      await newPage.goto(this.mainUrl, { waitUntil: 'networkidle2' });
      await delay(3000);
      return newPage;
    }
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.activePage = null;
    }
    if (this.chromeProcess) {
      this.chromeProcess.kill();
      this.chromeProcess = null;
    }
  }
}

// Utility function for safe evaluations
export async function safeEvaluate<T>(
  pageFn: (params: any) => T | Promise<T>,
  params: any,
  options: SafeEvaluateOptions = {}
): Promise<PageEvaluationResult<T>> {
  const { retries = 3, delayMs = 2000 } = options;
  const manager = await ChromeManager.getInstance('https://app.centraldispatch.com/price-check');
  console.log(manager)
  try {
    const page = await manager.getActivePage();
    console.log("Page, ", page)
    const result = await page.evaluate(pageFn, params);
    console.log("Result, ", result)
    return { success: true, data: result };
  } catch (error: unknown) {
    // Proper type narrowing and error handling
    if (error instanceof Error) {
      if (retries > 0) {
        if (isDetachedError(error)) {
          await delay(delayMs);
          return safeEvaluate(pageFn, params, { retries: retries - 1, delayMs });
        }

        if ((error as Error).message.includes("HTTP 401")) {
          const page = await manager.getActivePage();
          await page.goto('https://app.centraldispatch.com/price-check', { 
            waitUntil: 'networkidle2' 
          });
          await delay(3000);
          return safeEvaluate(pageFn, params, { retries: retries - 1, delayMs });
        }
      }
      return { success: false, error };
    }

    // Handle non-Error throwables (strings, objects, etc)
    return { 
      success: false, 
      error: new Error(
        typeof error === 'string' ? error : 'Unknown evaluation error'
      )
    };
  }
}

// Type guard for detachment errors
function isDetachedError(error: unknown): error is Error {
  return error instanceof Error && (
    error.message.includes('Execution context was destroyed') ||
    error.message.includes('detached') ||
    error.message.includes('Node is either not visible')
  );
}

// Utility function with proper typing
export async function delay(ms: number, options?: DelayOptions): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms, options));
}

export default ChromeManager;