import { Buffer } from 'buffer';
import { ENDPOINT_URL } from '@/lib/url';



type TarifParams = {
    username: string;
    password: string;
    client: string;
    article: string;
    qty: number;
    cur: string;
    svte: string;
    sexp: string;
    uom: string;
  };

  type Grp1Response = {
    CLIENT: string;
    ARTICLE: string;
    QTY: string;
    SVTE: string;
    SEXP: string;
    UOM: string;
    CUR: string;
    GROPRI: string;
    PRINET: string;
    MTNET: string;
  };
  
  export const parseSoapGrp1Response = (soapXml: string): Grp1Response => {
    const match = soapXml.match(/<resultXml[^>]*><!\[CDATA\[(.*?)\]\]><\/resultXml>/s);
    if (!match || match.length < 2) {
      throw new Error('Could not extract resultXml from SOAP response');
    }
  
    const jsonContent = match[1];
    let parsed: any;
  
    try {
      parsed = JSON.parse(jsonContent);
    } catch (err) {
      throw new Error('Invalid JSON inside CDATA of resultXml');
    }
  
    if (!parsed.GRP1) {
      throw new Error('GRP1 not found in parsed response');
    }
  
    return parsed.GRP1 as Grp1Response;
  };
  

export const getTarif = async (params: TarifParams): Promise<Grp1Response> => {
    const credentials = `${params.username}:${params.password}`;

    // React Native: use Buffer instead of btoa
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    const authHeader = `Basic ${encodedCredentials}`;

    const jsonPayload = {
        GRP1: {
            CLIENT: params.client,
            ARTICLE: params.article,
            QTY: params.qty,
            CUR: params.cur,
            SVTE: params.svte,
            SEXP: params.sexp,
            UOM: params.uom
        }
    };

    console.log("params", params)

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
                                <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wss="http://www.adonix.com/WSS">
                                    <soapenv:Header/>
                                    <soapenv:Body>
                                        <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                                            <callContext xsi:type="wss:CAdxCallContext">
                                                <codeLang xsi:type="xsd:string">FRA</codeLang>
                                                <poolAlias xsi:type="xsd:string">ZBPI</poolAlias>
                                                <poolId xsi:type="xsd:string">?</poolId>
                                                <requestConfig xsi:type="xsd:string">adxwss.beautify=true&adxwss.optreturn=json</requestConfig>
                                            </callContext>
                                            <publicName xsi:type="xsd:string">ZTARIF</publicName>
                                            <inputXml xsi:type="xsd:string"><![CDATA[${JSON.stringify(jsonPayload)}]]>
                                            </inputXml>
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
          const textResponse = await response.text();
          const grp1Data = parseSoapGrp1Response(textResponse);
          console.log("grp1Data", grp1Data)

          return grp1Data
    } catch (error) {
        console.error('Adonix SOAP Error:', error);
        throw error;
    }

    
}