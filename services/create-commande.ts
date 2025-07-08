import { XMLParser } from 'fast-xml-parser';

// Only needed in React Native for base64 encoding
import { Buffer } from 'buffer';
import { buildIFile, parseSageX3MaterialData } from '@/lib/utils';


type Line = {
    itemCode: string;
    qty: number;
    price?: number;
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

type CreateCommandeParams = {
  username: string;
  password: string;
  moduleToImport: string;
  command: CommandParams;
};




export const createCommande = async (params: CreateCommandeParams) => {
  const credentials = `${params.username}:${params.password}`;

  // React Native: use Buffer instead of btoa
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  const authHeader = `Basic ${encodedCredentials}`;
  const iFile = buildIFile(params.command);

  console.log("iFile", iFile);


  const jsonPayload = {
    GRP1: {

      I_MODIMP: params.moduleToImport,
      I_AOWSTA: 'NO',
      I_EXEC: 'REALTIME',
      I_RECORDSEP: '|',
      I_FILE: iFile
    },
  };

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wss="http://www.adonix.com/WSS">
   <soapenv:Header/>
   <soapenv:Body>
      <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <callContext xsi:type="wss:CAdxCallContext">
            <codeLang xsi:type="xsd:string">FRA</codeLang>
            <poolAlias xsi:type="xsd:string">ZBPI</poolAlias>
            <poolId xsi:type="xsd:string">?</poolId>
            <requestConfig xsi:type="xsd:string"> <![CDATA[adxwss.optreturn=JSON&adxwss.beautify=true&adxwss.trace.on=off]]></requestConfig>
         </callContext>
         <publicName xsi:type="xsd:string">AOWSIMPORT</publicName>
         <inputXml xsi:type="xsd:string">
		<![CDATA[${JSON.stringify(jsonPayload)}]]>
         </inputXml>
      </wss:run>
   </soapenv:Body>
</soapenv:Envelope>`;
    


  try {
    const response = await fetch(
      'http://192.168.2.118:8124/soap-generic/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'run',
          Authorization: authHeader,
        },
        body: soapEnvelope,
      }
    );

    if (response.status === 401) {
      throw new Error('Authentication failed - please check your username and password');
    }

    if (response.status === 403) {
      throw new Error('Access denied - you don\'t have permission to access this resource');
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Optional debug
    // const responseText = await response.text();
    // console.log('Raw SOAP Response:', responseText);

    // ✅ Parse the actual data
    if (response.status === 200) {
      return await response.text()
    }

    return await response.text()
  } catch (error) {
    console.error('Adonix SOAP Error:', error);
    throw error;
  }
};
