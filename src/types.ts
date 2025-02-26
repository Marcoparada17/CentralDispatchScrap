export interface PriceCheckRequest {
    stops: Array<{
        stopId: string;
        stopNumber: number;
        locationName: string;
        locationType: null;
        streetAddress1: string;
        streetAddress2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        longitude: null;
        latitude: null;
        selectdAddress: string;
    }>;
    vehicles: Array<{
        vin: string;
        year: string;
        make: string;
        model: string;
        vehicleType: string;
        isOperable: boolean;
        pickUpStopNumber: number;
        dropOffStopNumber: number;
    }>;
    trailerType: string;
}

// price-check-types.ts
export interface PriceCheckResponse {
    success: boolean;
    data: {
        href: string;
        count: number;
        items: ListingItem[];
    };
}

export interface ListingItem {
    trailerType: string;
    inoperable: boolean;
    dispatchPricePerMile: number;
    href: string;
    lowPrice: number;
    highPrice: number;
    meanPredictedPrice: number;
    originCity: string;
    originState: string;
    originZipCode: string;
    destinationCity: string;
    destinationState: string;
    destinationZipCode: string;
    vehicleType: string;
    vehicleSize: string;
    listingPrice: number;
    listingPricePerMile: number | null;
    listingCreationDate: string;
    dispatchDistance: number;
    dispatchDistanceUnits: string;
    listingDistance: number;
    listingDistanceUnits: string;
    dispatchStatus: string;
    dispatchPrice: number;
    dispatchPriceCurrency: string;
    dispatchDate: string;
}

// For status values seen in the sample (you can expand these as needed)
export type DispatchStatus =
    | 'NOT_SIGNED'
    | 'DELIVERED'
    | 'PENDING_PICKUP'
    | 'delivered'
    | 'cancel-broker';


export interface VehicleTypeResponse {
    years: number[];
    makes: string[];
    models: string[];
    vehicleType: string;
}