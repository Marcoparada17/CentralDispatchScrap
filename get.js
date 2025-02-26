const fs = require('fs');

// List of years to iterate over
const years = [
  1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990,
  1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
  2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
  2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
  2021, 2022, 2023, 2024, 2025, 2026
];

const fetchOptions = {
  method: 'GET',
  headers: {
    Pragma: 'no-cache',
    Accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFFODM0OTZCMjNCQzM4MTIzREM2NEU4M0UyMTg1RjdEIiwidHlwIjoiYXQrand0In0.eyJpc3MiOiJodHRwczovL2lkLmNlbnRyYWxkaXNwYXRjaC5jb20iLCJuYmYiOjE3NDA1OTc3NTgsImlhdCI6MTc0MDU5Nzc1OCwiZXhwIjoxNzQwNTk5NTU4LCJhdWQiOlsibGlzdGluZ3Mtc2VhcmNoLWFwaSIsInVzZXJfbWFuYWdlbWVudF9iZmYiXSwic2NvcGUiOlsib3BlbmlkIiwibGlzdGluZ3Nfc2VhcmNoIiwidXNlcl9tYW5hZ2VtZW50X2JmZiJdLCJhbXIiOlsicHdkIl0sImNsaWVudF9pZCI6InNpbmdsZV9zcGFfcHJvZF9jbGllbnQiLCJzdWIiOiJkZXZvcHNscCIsImF1dGhfdGltZSI6MTczOTkwNjgzNiwiaWRwIjoibG9jYWwiLCJ1c2VybmFtZSI6InNjdjBpZnZkIiwidGllckdyb3VwIjoiQnJva2VyIiwiY29tcGFueU5hbWUiOiJNYXJjYSBFLUNvbW1lcmNlIExMQyIsImN1c3RvbWVySWQiOiI0ZDIxZTYxNy1iMjY3LTRjYTgtYTQ3MS1lNjFiN2EwNmZkZjgiLCJhY3RpdmF0aW9uRGF0ZSI6IjIwMjQtMDQtMzAgMDg6NDU6NDIiLCJhY2NvdW50U3RhdHVzIjoiQWN0aXZlIiwiaXNBY3RpdmUiOnRydWUsInVzZXJJZCI6ImI2ZGU4Yzc5LTQwMTktNDg1MC1iMGZmLWE0NzUzY2MxYjNjNSIsInJvbGVzIjpbIlNUQU5EQVJEIl0sIm1hcmtldFBsYWNlSWRzIjpbMTAwMDBdLCJtYXJrZXRwbGFjZXMiOlt7Ik1hcmtldHBsYWNlSWQiOjEwMDAwLCJBY3RpdmUiOnRydWUsIlJlYXNvbkNvZGUiOiJDb21wbGV0ZS9BY3RpdmF0ZWQifV0sIm51bWJlck9mQWNjb3VudHMiOiIxIiwibG9naW5Vc2VybmFtZSI6ImRldm9wc2xwIiwiZmlyc3ROYW1lIjoiTHVpcyIsImxhc3ROYW1lIjoiUGFyYWRhIiwiZW1haWwiOiJsdWlzOTRzaEBnbWFpbC5jb20iLCJwcm9kdWN0cyI6W3siUHJvZHVjdElkIjoiN2Q3ODZiYTYtNmE3Zi00ZTMyLWI4OTEtMTcxMWM3YzcxYmE0IiwiTWFya2V0cGxhY2VJZCI6MTAwMDAsIlByb2R1Y3RTdGF0dXNLZXkiOiJhY3RpdmUifSx7IlByb2R1Y3RJZCI6IjVlNmY3Njc3LTE2M2QtNGU5Mi1hZTBkLWI1YmE3ZWQ3ZTBiYyIsIk1hcmtldHBsYWNlSWQiOjEwMDAwLCJQcm9kdWN0U3RhdHVzS2V5IjoiYWN0aXZlIn1dLCJtZmFFeHBpcmF0aW9uIjoiMCIsInBhcnRuZXJJZCI6IiIsInNpZCI6IkJBRERCQUExQzdEMDcwQ0YyRDczRDI4QjI3Q0EyMTI4In0.QRiZA1QekELRYrpO-m0jnrjUIhEJ523uZahRVblMGZEiZPlDLvTIOK-E_BDz_HOayWw7yAd0ocxK29B8fTg7N0v94ZUnl1BTGbxgISKPDUutwyVYTAKXN_j8RTOdFlGTrNOANqloVfFmuappWVhLg2wfjXR5mJE8vtNapRoscnpRzh5HV6gObW6y4oamNac8jCASlC_nbvvGP-5QXAyzbkssYlnmCJfY8X7ZC0gmr_fnjlrcycSvgjoUxnOXdpVoke-X8IRT-B9Etwizdy1c7dgAQBfqdLzfVrkSezLqt4srv61tH5XhPFSRtzSfWtVMIOhsUyEGtDymWJdDJVwV9A',
    'Sec-Fetch-Site': 'cross-site',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Mode': 'cors',
    'Accept-Encoding': 'gzip, deflate, br',
    Origin: 'https://app.centraldispatch.com',
    Referer: 'https://app.centraldispatch.com/',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
    'Sec-Fetch-Dest': 'empty',
    Priority: 'u=3, i'
  }
};

async function fetchMakes(year) {
  const url = `https://prod-listings-editor-bff.awscal.manheim.com/listing-Vehicles/search-vehicle-info?year=${year}`;
  try {
    const res = await fetch(url, fetchOptions);
    const json = await res.json();
    return json.makes || [];
  } catch (error) {
    console.error(`Error fetching makes for year ${year}:`, error);
    return [];
  }
}

async function fetchModels(year, make) {
  const url = `https://prod-listings-editor-bff.awscal.manheim.com/listing-Vehicles/search-vehicle-info?year=${year}&make=${encodeURIComponent(make)}`;
  try {
    const res = await fetch(url, fetchOptions);
    const json = await res.json();
    return json.models || [];
  } catch (error) {
    console.error(`Error fetching models for year ${year} and make ${make}:`, error);
    return [];
  }
}

async function buildData() {
  const finalData = {};

  for (const year of years) {
    console.log(`Processing year ${year}...`);
    const makes = await fetchMakes(year);
    if (makes.length === 0) continue;
    
    // Initialize the year property
    finalData[year] = {};

    for (const make of makes) {
      console.log(`  Fetching models for make ${make}...`);
      const models = await fetchModels(year, make);
      if (models.length > 0) {
        // Convert make name to lower case to match your desired structure
        finalData[year][make.toLowerCase()] = models;
      }
    }
  }

  return finalData;
}

buildData()
  .then(data => {
    // Write the data to data.json file
    fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('Data saved to data.json');
      }
    });
  })
  .catch(err => {
    console.error('Error building data:', err);
  });