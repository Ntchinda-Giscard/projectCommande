import { XMLParser } from 'fast-xml-parser';

// Only needed in React Native for base64 encoding
import { Buffer } from 'buffer';
import { parseSageX3LoginFlatString } from '@/lib/utils';
import { ENDPOINT_URL } from '@/lib/url';

type LoginParams = {
  username: string;
  password: string;
  moduleToExport: string;
  userNameCriteria?: string;
  passwordCriteria?: string;
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

  // console.log('✅ Extracted JSON:', resultJson);
  return resultJson;
};

export const callAdonixSoapServiceWithAuth = async (params: LoginParams) => {
  const credentials = `${params.username}:${params.password}`;

  // React Native: use Buffer instead of btoa
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  const authHeader = `Basic ${encodedCredentials}`;

  const jsonPayload = {
    GRP1: {
      I_MODEXP: params.moduleToExport,
      I_CHRONO: 'NO',
    },
    GRP2: [
      { I_TCRITERE: `ZUSER='${params.userNameCriteria}'` },
      { I_TCRITERE: `ZPWD='${params.passwordCriteria}'` },
    ],
    GRP3: {
      I_EXEC: 'REALTIME',
      I_RECORDSEP: '|',
    },
  };

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                      xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                      xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                      xmlns:wss="http://www.adonix.com/WSS">
      <soapenv:Header/>
      <soapenv:Body>
        <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
          <callContext xsi:type="wss:CAdxCallContext">
            <codeLang xsi:type="xsd:string">FRA</codeLang>
            <poolAlias xsi:type="xsd:string">ZBPI</poolAlias>
            <poolId xsi:type="xsd:string"/>
            <requestConfig xsi:type="xsd:string">adxwss.beautify=true&amp;adxwss.optreturn=JSON</requestConfig>
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
    // console.log("File texed: ", await response.text())
    const resultJson = await parseSoapResponse(response);
    const jsonParsed = parseSageX3LoginFlatString(resultJson['GRP3']['O_FILE'])
    console.log("jsonParsed", jsonParsed)
    return jsonParsed;
  } catch (error) {
    console.error('Adonix SOAP Error:', error);
    throw error;
  }
};
