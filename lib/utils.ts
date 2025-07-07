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
  