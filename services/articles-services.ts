import { XMLParser } from 'fast-xml-parser';

// Only needed in React Native for base64 encoding
import { Buffer } from 'buffer';
import { parseSageX3MaterialData } from '@/lib/utils';
import { ENDPOINT_URL } from '@/lib/url';

type ArticlesParams = {
  username: string;
  password: string;
  moduleToExport: string;
};

const parseSoapResponse = async (response: { text: () => Promise<string> }) => {
  const xmlText = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata', // capture CDATA content
  });

  const json = parser.parse(xmlText);

  const resultXmlCdata =
    json?.['soapenv:Envelope']
        ?.['soapenv:Body']
        ?.['wss:runResponse']
        ?.['runReturn']
        ?.['resultXml']
        ?.['__cdata'];

  if (!resultXmlCdata) {
    throw new Error('No resultXml CDATA found');
  }

  const resultJson = JSON.parse(resultXmlCdata);

//   console.log('✅ Extracted JSON:', resultJson);
  return resultJson;
};

export const listArticles = async (params: ArticlesParams) => {
  const credentials = `${params.username}:${params.password}`;

  // React Native: use Buffer instead of btoa
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  const authHeader = `Basic ${encodedCredentials}`;

  const jsonPayload = {
    GRP1: {
      I_MODEXP: params.moduleToExport,
      I_CHRONO: 'NO',
    },
    GRP2: [],
    GRP3: {
      I_EXEC: 'REALTIME',
      I_RECORDSEP: '|',
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
            <requestConfig xsi:type="xsd:string">adxwss.optreturn=JSON&amp;adxwss.beautify=true</requestConfig>
         </callContext>
         <publicName xsi:type="xsd:string">AOWSEXPORT</publicName>
         <inputXml xsi:type="xsd:string">${JSON.stringify(jsonPayload)}</inputXml>
      </wss:run>
   </soapenv:Body>
</soapenv:Envelope>`;
    


  try {
    const response = await fetch(
      ENDPOINT_URL,
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
    const resultJson = await parseSoapResponse(response);
    const articles = resultJson["GRP3"]["O_FILE"];
    const parsedArticles = parseSageX3MaterialData(articles);
    console.log("Articles parsed:", JSON.stringify(parsedArticles.slice(0, 1),null, 2))
    return parsedArticles;
  } catch (error) {
    console.error('Adonix SOAP Error:', error);
    throw error;
  }
};
