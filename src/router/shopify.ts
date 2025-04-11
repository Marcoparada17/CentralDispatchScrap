import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import { RegisterRequestBody, TriggerQuoteRequestBody } from '../types';
import { 
  createCustomerGraphQL, 
  createDraftOrderGraphQL, 
  createOrderGraphQL,
  findCustomerByEmail,
  triggerSendQuote,
  updateCustomerMetafields,
  updateDraftOrderMetafields, 
  updateOrderMetafields,
} from '../lib/shopify-service';
dotenv.config();

const router = Router();

// ----------------------
// Endpoint: Register Customer (or trigger quote if exists)
// ----------------------
router.post('/register', async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  const { email, firstName, lastName } = req.body;

  try {
    const customers = await findCustomerByEmail(email);
    let customerGlobalId: string;
    if (customers && customers.length > 0) {
      const existingCustomer = customers[0];
      const updateResult = await triggerSendQuote(existingCustomer.id, existingCustomer.tags);
      customerGlobalId = updateResult.customer.id;
      res.status(200).json({
        message: "Customer already exists. Triggered send_quote event (tag updated).",
        customer: updateResult.customer,
      });
    } else {
      const createResponse = await createCustomerGraphQL(email, firstName, lastName);
      if (createResponse.customer) {
        customerGlobalId = createResponse.customer.id;
        res.status(200).json({
          message: "Customer created successfully via GraphQL.",
          customer: createResponse.customer,
        });
      } else {
        res.status(400).json({
          message: "Failed to create customer.",
          errors: createResponse.userErrors,
        });
      }
    }
  } catch (error: any) {
    console.error('Error in /register:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});


router.post('/registerOrder', async (req: Request<{}, {}>, res: Response) => {
  const { email, model, finalPrice, customerLocale } = req.body;

  try {
    // Create pricingData object from the request body
    const pricingData = {
      email,
      model,
      finalPrice,
      customerLocale: customerLocale === 'es' ? 'es' : 'en'
    };

    // 1. Create a new draft order
    const draftOrder = await createDraftOrderGraphQL(pricingData);
    
    // 2. Update the draft order's metafields with pricingData.
    // The draftOrder.id should already be in global format.
    const metafieldsResult = await updateDraftOrderMetafields(draftOrder.id, pricingData);
    
    res.status(200).json({
      message: "Draft order created and metafields updated successfully.",
      draftOrder,
      metafields: metafieldsResult.metafields,
    });
  } catch (error: any) {
    console.error("Error in /registerOrder:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------
// Endpoint: Trigger Quote Email Event (for existing customer)
// ----------------------
router.post('/triggerQuote', async (req: Request<{}, {}, TriggerQuoteRequestBody>, res: Response) => {
  const { email } = req.body;
  try {
    const customers = await findCustomerByEmail(email);
    if (customers && customers.length > 0) {
      const customer = customers[0];
      const result = await triggerSendQuote(customer.id, customer.tags);
      res.status(200).json({
        message: "Triggered send_quote event for customer (tag updated).",
        customer: result.customer,
      });
    } else {
      res.status(404).json({ error: "Customer not found." });
    }
  } catch (error: any) {
    console.error('Error in /triggerQuote:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/createOrder', async (req: Request<{}, {}>, res: Response) => {
  const { email, model, finalPrice, customerLocale } = req.body;

  try {
    // Create pricingData object from the request body
    const pricingData = {
      email,
      model,
      finalPrice,
      customerLocale: customerLocale === 'es' ? 'es' : 'en'
    };

    // 1. Create a new order
    const order = await createOrderGraphQL(pricingData);
    
    // 2. Update the order's metafields with pricingData
    const metafieldsResult = await updateOrderMetafields(order.id, pricingData);
    
    res.status(200).json({
      message: "Order created and metafields updated successfully.",
      order,
      metafields: metafieldsResult.metafields,
    });
  } catch (error: any) {
    console.error("Error in /createOrder:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;