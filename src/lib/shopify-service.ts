import axios from 'axios';

export async function findCustomerByEmail(email: string): Promise<any[]> {
  try {
    const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
    console.log('Finding customer by email:', url, process.env.SHOPIFY_ACCESS_TOKEN as string);
    const headers = {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN as string,
      'Content-Type': 'application/json',
    };
    const query = `
      query CheckCustomerEmail($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
            }
          }
        }
      }
    `;
    const variables = { query: `email:${email}` };
    const response = await axios.post(url, { query, variables }, { headers });
    console.log('Customer search response:', response.data);
    const edges = response.data.data.customers.edges;
    // Map the GraphQL edges to a list of customer nodes.
    return edges.map((edge: any) => edge.node);
  } catch (error: any) {
    console.error('Error fetching customer by email:', error.data.errors);
    throw new Error('Failed to fetch customer by email');
  }
}

// Helper function: Update a customer's tags to include "send_quote" using REST API
export async function triggerSendQuote(customerId: number | string, currentTags: string | null): Promise<any> {
  const now = new Date().toISOString();
  const newTag = `send_quote:${now}`;

  let updatedTags: string;
  if (currentTags && currentTags.trim() !== "") {
    const tagsArray = currentTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => !tag.startsWith("send_quote:"));
    tagsArray.push(newTag);
    updatedTags = tagsArray.join(", ");
  } else {
    updatedTags = newTag;
  }

  // If the customerId is already in global format, use it; otherwise, prepend.
  const globalCustomerId =
    (typeof customerId === "string" && customerId.startsWith("gid://shopify/Customer/"))
      ? customerId
      : `gid://shopify/Customer/${customerId}`;

  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN as string,
  };

  const mutation = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    input: {
      id: globalCustomerId,
      tags: updatedTags,
    }
  };

  const response = await axios.post(url, { query: mutation, variables }, { headers });
  console.log('Update customer tag response:', response.data);
  
  if (!response.data.data || !response.data.data.customerUpdate) {
    throw new Error(JSON.stringify(response.data.errors || 'Unknown error'));
  }
  
  return response.data.data.customerUpdate;
}


export async function createCustomerGraphQL(email: string, firstName: string, lastName: string) {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN as string,
  };
  const query = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    input: {
      firstName,
      lastName,
      email
    }
  };

  const response = await axios.post(url, { query, variables }, { headers });
  console.log('Create customer response:', response.data);
  
  if (!response.data.data || !response.data.data.customerCreate) {
    throw new Error(JSON.stringify(response.data.errors || 'Unknown error'));
  }
  
  return response.data.data.customerCreate;
}


export async function updateCustomerMetafields(
  customerGlobalId: string,
  pricingData: Record<string, any>
): Promise<any> {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN as string,
  };

  // Convert the pricingData into an array of MetafieldsSetInput objects.
  const metafields = Object.entries(pricingData).map(([key, value]) => ({
    ownerId: customerGlobalId,
    namespace: "pricing",
    key: key,
    value: String(value),
    type: "single_line_text_field" // adjust type if needed
  }));

  const mutation = `
    mutation metafieldsSet($input: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $input) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = { input: metafields };

  const response = await axios.post(url, { query: mutation, variables }, { headers });
  console.log('Update metafields response:', response.data);

  if (!response.data.data || !response.data.data.metafieldsSet) {
    throw new Error(JSON.stringify(response.data.errors || 'Unknown error'));
  }
  
  return response.data.data.metafieldsSet;
}

export async function createDraftOrderGraphQL(pricingData: Record<string, any>): Promise<any> {
  // Build a minimal DraftOrderInput. We include the customer's email,
  // a dummy line item, and a tag to identify the order as a draft quote.
  const draftOrderInput = {
    email: pricingData.email,
    lineItems: [
      {
        title: `Transport ${pricingData.model}`,
        quantity: 1,
        originalUnitPrice: pricingData.finalPrice,
      },
    ],
    tags: "draft_quote",
  };

  const mutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          invoiceUrl
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN as string,
  };
  const variables = { input: draftOrderInput };

  const response = await axios.post(url, { query: mutation, variables }, { headers });
  console.log("Draft order create response:", response.data);

  if (!response.data.data || !response.data.data.draftOrderCreate) {
    throw new Error(JSON.stringify(response.data.errors || "Unknown error"));
  }

  const { draftOrder, userErrors } = response.data.data.draftOrderCreate;
  if (userErrors && userErrors.length) {
    throw new Error(JSON.stringify(userErrors));
  }

  return draftOrder;
}

export async function updateDraftOrderMetafields(
  draftOrderGlobalId: string,
  pricingData: Record<string, any>
): Promise<any> {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN as string,
  };

  // Convert your pricingData into an array of MetafieldsSetInput objects.
  const metafields = Object.entries(pricingData).map(([key, value]) => ({
    ownerId: draftOrderGlobalId,
    namespace: "pricing",
    key: key,
    value: String(value),
    type: "single_line_text_field" // Change type if needed
  }));

  const mutation = `
    mutation metafieldsSet($input: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $input) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = { input: metafields };

  const response = await axios.post(url, { query: mutation, variables }, { headers });
  console.log("Update metafields response:", response.data);

  if (!response.data.data || !response.data.data.metafieldsSet) {
    throw new Error(JSON.stringify(response.data.errors || "Unknown error"));
  }
  
  return response.data.data.metafieldsSet;
}

export async function createOrderGraphQL(pricingData: Record<string, any>): Promise<any> {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN as string,
  };

  try {
    // First, try to find and update the customer using GraphQL
    const graphqlUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
    const findCustomerQuery = `
      query findCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              email
              acceptsMarketing
              firstName
              lastName
              locale
            }
          }
        }
      }
    `;

    const findCustomerVariables = {
      query: `email:${pricingData.email}`
    };

    const customerResponse = await axios.post(
      graphqlUrl,
      { query: findCustomerQuery, variables: findCustomerVariables },
      { headers }
    );

    let customerLocale = pricingData.customerLocale || "en";
    let customerId = null;

    if (customerResponse.data.data?.customers?.edges?.length > 0) {
      const customer = customerResponse.data.data.customers.edges[0].node;
      customerId = customer.id;
      
      // Update customer's locale if it's different
      if (customer.locale !== customerLocale) {
        const updateCustomerMutation = `
          mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer {
                id
                locale
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const updateVariables = {
          input: {
            id: customerId,
            locale: customerLocale
          }
        };

        const updateResult = await axios.post(graphqlUrl, { query: updateCustomerMutation, variables: updateVariables }, { headers });
        console.log('Customer update response:', updateResult.data);

        // Wait a moment for the customer update to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      // If customer doesn't exist, create a new one with the correct locale
      const createCustomerMutation = `
        mutation customerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
              email
              locale
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const createVariables = {
        input: {
          email: pricingData.email,
          locale: customerLocale,
          acceptsMarketing: false
        }
      };

      const createResponse = await axios.post(graphqlUrl, { query: createCustomerMutation, variables: createVariables }, { headers });
      console.log('Customer create response:', createResponse.data);
      
      if (createResponse.data.data?.customerCreate?.customer) {
        customerId = createResponse.data.data.customerCreate.customer.id;
        // Wait a moment for the customer creation to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Create the order using REST API
    const restUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/orders.json`;
    const orderData = {
      order: {
        email: pricingData.email,
        customer_id: customerId ? parseInt(customerId.split('/').pop() || '0') : null,
        line_items: [
          {
            title: `Transport ${pricingData.model}`,
            quantity: 1,
            price: pricingData.finalPrice.toString(),
            taxable: true
          }
        ],
        tags: ["transport_order"],
        note: `Transport order for ${pricingData.model}`,
        financial_status: "pending",
        metafields: [
          {
            namespace: "email",
            key: "locale",
            value: customerLocale,
            type: "single_line_text_field"
          }
        ]
      }
    };

    const response = await axios.post(restUrl, orderData, { headers });
    console.log("Order create response:", response.data);

    if (!response.data.order) {
      throw new Error("Failed to create order");
    }

    // After creating the order, update its metafields with all pricing data
    try {
      const metafieldsResult = await updateOrderMetafields(
        `gid://shopify/Order/${response.data.order.id}`,
        {
          ...pricingData,
          customerLocale: customerLocale,
          email_locale: customerLocale // Adding a dedicated field for email localization
        }
      );
      return {
        order: response.data.order,
        metafields: metafieldsResult.metafields
      };
    } catch (metafieldError) {
      console.error("Error updating metafields:", metafieldError);
      return {
        order: response.data.order,
        metafields: null
      };
    }
  } catch (error: any) {
    console.error("Error in createOrderGraphQL:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateOrderMetafields(
  orderGlobalId: string | number,
  pricingData: Record<string, any>
): Promise<any> {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN as string,
  };

  // Ensure the orderGlobalId is in the correct format
  const idString = String(orderGlobalId);
  const formattedGlobalId = idString.startsWith('gid://') 
    ? idString 
    : `gid://shopify/Order/${idString}`;

  // Convert the pricingData into an array of MetafieldsSetInput objects
  const metafields = Object.entries(pricingData).map(([key, value]) => ({
    ownerId: formattedGlobalId,
    namespace: "pricing",
    key: key,
    value: String(value),
    type: "single_line_text_field"
  }));

  const mutation = `
    mutation metafieldsSet($input: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $input) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = { input: metafields };

  const response = await axios.post(url, { query: mutation, variables }, { headers });
  console.log("Update order metafields response:", JSON.stringify(response.data, null, 2));

  if (!response.data.data || !response.data.data.metafieldsSet) {
    throw new Error(JSON.stringify(response.data.errors || "Unknown error"));
  }
  
  return response.data.data.metafieldsSet;
}