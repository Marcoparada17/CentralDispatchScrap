import { Request, Response, Router } from 'express';
import ChromeManager, { safeEvaluate } from '../lib/page-manager';
import { PriceCheckResponse, VehicleTypeResponse } from '../types';

const getData = Router();
const mainUrl = 'https://app.centraldispatch.com/price-check';

getData.get('/check', async (req: Request, res: Response) => {
  try {
 
    const result = await safeEvaluate<PriceCheckResponse>(async () => {
      const NavBffKey = localStorage.getItem('NavBffKey');
      console.log('Checking NavBffKey:', NavBffKey);
      const response = await fetch(
        'https://prod-price-check-app-bff.awsmanlog2.manheim.com/listing-prices',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            Authorization: `Bearer ${NavBffKey}`,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json; charset=utf-8',
            Pragma: 'no-cache',
            Priority: 'u=3, i',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
          },
          body: JSON.stringify({
            stops: [
              {
                stopId: '',
                stopNumber: 1,
                locationName: '',
                locationType: null,
                streetAddress1: '3333 James Snow Parkway North',
                streetAddress2: '',
                city: 'Milton',
                state: 'ON',
                postalCode: 'L9T 8L1',
                country: 'CA',
                longitude: null,
                latitude: null,
                selectdAddress: '3333 James Snow Parkway North, Milton, ON, Canada',
              },
              {
                stopId: '',
                stopNumber: 2,
                locationName: '',
                locationType: null,
                streetAddress1: '4444 Rue Jarry Est',
                streetAddress2: '',
                city: 'Montréal',
                state: 'QC',
                postalCode: 'H1R 1X3',
                country: 'CA',
                longitude: null,
                latitude: null,
                selectdAddress: '4444 Rue Jarry Est, Saint-Leonard, QC, Canada',
              },
            ],
            vehicles: [
              {
                vin: '',
                year: '1984',
                make: 'Dodge',
                model: 'D250',
                vehicleType: 'PICKUP',
                isOperable: true,
                pickUpStopNumber: 1,
                dropOffStopNumber: 2,
              },
            ],
            trailerType: 'Open',
          }),
          cache: 'default',
          credentials: 'include',
          mode: 'cors',
          redirect: 'follow',
          referrer: 'https://app.centraldispatch.com/',
          referrerPolicy: 'strict-origin-when-cross-origin',
        }
      );
      console.log('Response:', response);
      if (!response.ok) {
        const textErr = await response.text();
        throw new Error(`HTTP ${response.status} - ${textErr}`);
      }
      return response.json();
    }, {
      retries: 3,
      delayMs: 2000
    });

    if (!result.success) {
      throw result.error;
    }

    res.json({ success: true, data: result.data });
  } catch (err: unknown) {
    console.error('Error in /check endpoint:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ 
      success: false,
      error: errorMessage
    });
  }
});


/**
 * This endpoint receives a JSON body containing:
 * - stops: array of stops objects
 * - vehicles: array of vehicles objects
 * - trailerType: string
 *
 * It then triggers the browser fetch, retrieving navBffKey from localStorage.
 */
getData.post('/fetch-data', async (req: Request, res: Response) => {
  try {
    const { stops, vehicles, trailerType } = req.body;

    const result = await safeEvaluate<PriceCheckResponse>(
      async (params: { stops: any; vehicles: any; trailerType: string }) => {
        const { stops, vehicles, trailerType } = params;
        const navBffKey = localStorage.getItem('NavBffKey');
        const response = await fetch(
          'https://prod-price-check-app-bff.awsmanlog2.manheim.com/listing-prices',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
              Authorization: `Bearer ${navBffKey}`,
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json; charset=utf-8',
              Pragma: 'no-cache',
              Priority: 'u=3, i',
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
            },
            body: JSON.stringify({ stops, vehicles, trailerType }),
            cache: 'default',
            credentials: 'include',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'https://app.centraldispatch.com/',
            referrerPolicy: 'strict-origin-when-cross-origin',
          }
        );

        if (!response.ok) {
          const textErr = await response.text();
          throw new Error(`HTTP ${response.status} - ${textErr}`);
        }
        return response.json();
      },
      { stops, vehicles, trailerType },
      { retries: 3, delayMs: 2000 }
    );

    if (!result.success) {
      throw result.error;
    }

   // Send the JSON result back to the client
    res.json({ success: true, data: result.data });
  } catch (err: unknown) {
    console.error('Error in /fetch-data endpoint:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * 
 * 
 */
getData.post('/fetch-vehicle-type', async (req: Request, res: Response) => {
  try {
    const { year, make, model } = req.body;


    // Execute safe evaluation with retry logic, passing data as an argument
    const result = await safeEvaluate<VehicleTypeResponse>(
      async (params: { year: string; make: string; model: string }) => {
        const { year, make, model } = params;
        const navBffKey = localStorage.getItem('NavBffKey');
        const url = new URL('https://prod-listings-editor-bff.awscal.manheim.com/listing-Vehicles/search-vehicle-info');
        url.searchParams.append('year', year);
        url.searchParams.append('make', make);
        url.searchParams.append('model', model);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            Authorization: `Bearer ${navBffKey}`,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json; charset=utf-8',
            Pragma: 'no-cache',
            Priority: 'u=3, i',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
          },
          cache: 'default',
          credentials: 'include',
          mode: 'cors',
          redirect: 'follow',
          referrer: 'https://app.centraldispatch.com/',
          referrerPolicy: 'strict-origin-when-cross-origin',
        });

        if (!response.ok) {
          const textErr = await response.text();
          throw new Error(`HTTP ${response.status} - ${textErr}`);
        }
        return response.json();
      },
      { year, make, model },
      { retries: 3, delayMs: 2000 }
    );

    if (!result.success) {
      throw result.error;
    }

    //  Send the JSON result back to the client
    res.json({ success: true, data: result.data });
  } catch (err: unknown) {
    console.error('Error in /fetch-data endpoint:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});
export default getData;