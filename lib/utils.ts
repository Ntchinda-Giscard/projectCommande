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
  
  