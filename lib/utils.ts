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
          // push prior
          if (curr) mats.push(curr);
  
          curr = {
            family:        f[1],
            itemCode:      f[2],
            description:   f[3].replace(/~~FRA/g, ''), // strip language tag
            baseUoM:       f[4] || f[6],               // X3 can repeat
            salesUoM:      f[5] || f[7],
            weightPerUoM:  parseFloat(f[8]) || 0,
            purchaseUoM:   f[9],
            purchaseConversion: parseFloat(f[10]) || 1,
            minStockLevel: parseFloat(f[14]) || 0,
            category:      f[16],
            status:        f[17],
            parties:       [],
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
              plant:         f[1],
              location:      f[2],
              stockStatus:   f[3],
              onHandQty:     parseFloat(f[4]) || 0,
              uom:           f[5],
              uomConversion: parseFloat(f[6]) || 1,
            });
          }
          break;
  
        default:
          // ignore others
          break;
      }
    }
  
    if (curr) mats.push(curr);
    return mats;
  };
  