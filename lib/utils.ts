type ParsedData = {
    customer?: string[];
    addresses: string[][];
    deliveries: string[][];
    contacts: string[][];
  };
  
  export const parseSageX3ExportData = (rawData: string): ParsedData => {
    const result: ParsedData = {
      customer: undefined,
      addresses: [],
      deliveries: [],
      contacts: [],
    };
  
    const lines = rawData.split('|').filter(Boolean);
  
    lines.forEach((line) => {
      const fields = line.split(';');
      const recordType = fields[0];
  
      switch (recordType) {
        case 'B':
          result.customer = fields;
          break;
        case 'A':
          result.addresses.push(fields);
          break;
        case 'D':
          result.deliveries.push(fields);
          break;
        case 'C':
          result.contacts.push(fields);
          break;
        default:
          console.warn('❓ Unknown record type:', recordType, fields);
      }
    });
  
    return result;
  };



  type LineItem = {
    code: string;
    description?: string;
    unit: string;
    quantity: number;
    price: number;
  };
  
  type Document = {
    site: string;
    type: string;
    number: string;
    customer: string;
    date: string;
    reference?: string;
    currency?: string;
    lines: LineItem[];
  };
  
  export const parseSageX3DocumentLines = (raw: string): Document[] => {
    const records = raw.split('|').filter(Boolean);
    const result: Document[] = [];
  
    let currentDoc: Document | null = null;
  
    for (const record of records) {
      const fields = record.split(';');
      const type = fields[0];
  
      if (type === 'E') {
        // Close previous doc
        if (currentDoc) {
          result.push(currentDoc);
        }
  
        // Start new document
        currentDoc = {
          site: fields[1],         // e.g. AU012
          type: fields[2],         // e.g. SON
          number: fields[3],       // e.g. SONAU0120001
          customer: fields[4],     // e.g. AU002
          date: fields[5],         // e.g. 20230603
          reference: fields[6] || undefined,  // e.g. BIKE13-06
          currency: fields[8] || undefined,   // e.g. AUD
          lines: [],
        };
      }
  
      if (type === 'L' && currentDoc) {
        const line: LineItem = {
          code: fields[1],                     // e.g. FIN001
          description: fields[2] || undefined, // e.g. "Red Wagon"
          unit: fields[3],                     // e.g. UN
          quantity: parseFloat(fields[4]),     // e.g. 1
          price: parseFloat(fields[5]),        // e.g. 322.5
        };
  
        currentDoc.lines.push(line);
      }
    }
  
    // Push last doc
    if (currentDoc) {
      result.push(currentDoc);
    }
  
    return result;
  };
  
  

  type PartyInfo = {
    plant: string;
    location: string;
    stockStatus: string;
    onHandQty: number;
    uom: string;
    uomConversion: number;
  };
  
  type Material = {
    itemCode: string;
    family: string;
    description: string;
    baseUoM: string;
    salesUoM: string;
    weightPerUoM: number;
    purchaseUoM: string;
    purchaseConversion: number;
    minStockLevel: number;
    category: string;
    status: string;
    salesPrice?: number;
    parties: PartyInfo[];
  };
  
  export const parseSageX3MaterialData = (raw: string): Material[] => {
    const recs = raw.split('|').filter(Boolean);
    const mats: Material[] = [];
    let curr: Material | null = null;
  
    for (const rec of recs) {
      const f = rec.split(';');
      switch (f[0]) {
        case 'I':
          if (curr) mats.push(curr);
  
          curr = {
            family:             f[1],
            itemCode:           f[2],
            description:        (f[3] || '').replace(/~~FRA/g, ''),
            baseUoM:            f[6] || '',
            salesUoM:           f[7] || '',
            weightPerUoM:       parseFloat(f[8]) || 0,
            purchaseUoM:        f[9] || '',
            purchaseConversion: parseFloat(f[10]) || 1,
            minStockLevel:      parseFloat(f[14]) || 0,
            category:           f[16] || '',
            status:             f[17] || '',
            parties:            [],
          };
          break;
  
        case 'S':
          if (curr) {
            const price = parseFloat(f[4]);
            if (!isNaN(price)) curr.salesPrice = price;
          }
          break;
  
        case 'P':
          if (curr) {
            curr.parties.push({
              plant:         f[1] || '',
              location:      f[2] || '',
              stockStatus:   f[3] || '',
              onHandQty:     parseFloat(f[4]) || 0,
              uom:           f[5] || '',
              uomConversion: parseFloat(f[6]) || 1,
            });
          }
          break;
  
        default:
          break;
      }
    }
  
    if (curr) mats.push(curr);
    return mats;
  };
  


  type Line = {
    itemCode: string;
    qty: number;
    price?: number;
    designation: string;
    salesUoM?: string
  };
  
  type CommandParams = {
    site: string;         // e.g. "FR011"
    orderType: string;    // e.g. "SOI"
    customer: string;     // e.g. "AU002"
    date: string;         // "YYYYMMDD"
    shipSite: string;     // e.g. "FR011"
    currency: string;     // e.g. "EUR"
    lines: Line[];
  };
  
  /**
   * Build the I_FILE string: one E‑record, many L‑records, and END
   */
  export const buildIFile = ({
  site,
  orderType,
  customer,
  date,
  shipSite,
  currency,
  lines,
}: CommandParams): string => {
  const headerFields = [
    "E",
    site,
    orderType,
    "",           // numéro de commande auto
    customer,
    date,
    "",           // référence
    shipSite,
    currency,
    "", "", "", "", "", // padding
  ];
  const header = headerFields.join(";");

  const lineRecs = lines.map(({ itemCode, qty, price = 0, designation, salesUoM }) => {
    const fields = [
      "L",
      itemCode,
      designation || "",        // désignation personnalisée
      salesUoM || "UN",         // unité de vente dynamique, fallback sur "UN"
      qty.toString(),
      price.toString(),
      "0", "0", "0", "",        // remises / taxes
    ];
    return fields.join(";");
  });

  return [header, ...lineRecs, "END"].join("|");
};


  type Header = {
    country: string;
    customerCode: string;
    invoiceAddress: string;
    deliveryAddress: string;
    orderAddress: string;
    transportAddress: string;
    currency: string;
    contactCode: string;
    deliveryMode: string;
    paymentTerm: string;
    transportType: string;
    fixedCharges: number;
    variableCharges: number;
    netAmount: number;
    numberOfPackages: number;
  };
  
  type Address = {
    code: string;
    city: string;
    addressLine: string;
    postalCode: string;
    country: string;
    phone: string;
    contactCode: string;
  };
  
  type Recipient = {
    addressCode: string;
    companyName: string;
    quantity: number;
  };
  
  type Contact = {
    code: string;
    civilityCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    roleCode: string;
  };
  
  type ParsedDataLogin = {
    header: Header | null;
    addresses: Address[];
    recipients: Recipient[];
    contact: Contact | null;
  };
  
  /**
   * Parses a Sage X3 flat export string into structured JSON
   */
  export function parseSageX3LoginFlatString(raw: string): ParsedDataLogin {
    const result: ParsedDataLogin = {
      header: null,
      addresses: [],
      recipients: [],
      contact: null,
    };
  
    const lines = raw.split('|').filter(Boolean);
    for (const line of lines) {
      const fields = line.split(';');
      const type = fields[0];
  
      switch (type) {
        case 'B': {
          // Header
          result.header = {
            country: fields[1],
            customerCode: fields[2],
            invoiceAddress: fields[5] || fields[6] || '',
            deliveryAddress: fields[6] || '',
            orderAddress: fields[7] || '',
            transportAddress: fields[8] || '',
            currency: fields[9],
            contactCode: fields[13],
            deliveryMode: fields[14],
            paymentTerm: fields[15],
            transportType: fields[16],
            fixedCharges: Number(fields[17]) || 0,
            variableCharges: Number(fields[18]) || 0,
            netAmount: Number(fields[19]) || 0,
            numberOfPackages: Number(fields[20]) || 0,
          };
          break;
        }
  
        case 'A': {
          // Address
          const addr: Address = {
            code: fields[1],
            city: fields[2],
            addressLine: fields[3],
            postalCode: fields[6],
            country: fields[7],
            phone: fields[8],
            contactCode: fields[11],
          };
          result.addresses.push(addr);
          break;
        }
  
        case 'D': {
          // Recipient
          const rec: Recipient = {
            addressCode: fields[1],
            companyName: fields[2],
            quantity: Number(fields[6]) || 0,
          };
          result.recipients.push(rec);
          break;
        }
  
        case 'C': {
          // Contact
          result.contact = {
            code: fields[1],
            civilityCode: fields[2],
            firstName: fields[3],
            lastName: fields[4],
            phone: fields[5],
            roleCode: fields[6],
          };
          break;
        }
  
        default:
          console.warn('Unknown record type:', type);
      }
    }
  
    return result;
  }
  