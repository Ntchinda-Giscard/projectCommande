// services/soapClient.js
import { httpClient } from './httpClient';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false });

/**
 * Wraps your SOAP body fragment in a full Envelope with namespaces
 */
function wrapInEnvelope(bodyFragment: any) {
  return `
    <soapenv:Envelope
        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"
        xmlns:wss="http://www.adonix.com/WSS">
      <soapenv:Header/>
      <soapenv:Body>
        ${bodyFragment}
      </soapenv:Body>
    </soapenv:Envelope>
  `;
}

/**
 * Generic SOAP caller: posts to baseURL with SOAPAction header, returns Body node
 */
async function callSoapOperation(action: string, bodyFragment: string) {
  const envelope = wrapInEnvelope(bodyFragment);

  const response = await httpClient.post(
    '',            // posts to exactly httpClient.baseURL
    envelope,
    {
      headers: {
        SOAPAction: `"http://www.adonix.com/WSS/${action}"`
      }
    }
  );

  // Parse full XML → JS object
  const xmlObj = parser.parse(response.data);
  return xmlObj['soapenv:Envelope']['soapenv:Body'];
}

/**
 * AOWSEXPORT operation wrapper
 */
export async function runAowsexport(callContext: { codeLang: any; poolAlias: any; poolId: any; requestConfig: any; }, inputJson: any) {
  const fragment = `
    <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <callContext xsi:type="wss:CAdxCallContext">
        <codeLang xsi:type="xsd:string">${callContext.codeLang}</codeLang>
        <poolAlias xsi:type="xsd:string">${callContext.poolAlias}</poolAlias>
        <poolId   xsi:type="xsd:string">${callContext.poolId || ''}</poolId>
        <requestConfig xsi:type="xsd:string">${callContext.requestConfig}</requestConfig>
      </callContext>
      <publicName xsi:type="xsd:string">AOWSEXPORT</publicName>
      <inputXml xsi:type="xsd:string">${JSON.stringify(inputJson)}</inputXml>
    </wss:run>
  `;

  const bodyNode = await callSoapOperation('run', fragment);
  const runReturn = bodyNode['wss:runResponse']['runReturn'];
  const jsonText = runReturn['resultXml'];
  return JSON.parse(jsonText);
}

/**
 * Example: another operation wrapper (e.g. getArticleDetails)
 */
export async function getArticleDetails(callContext: { codeLang: any; poolAlias: any; poolId: any; requestConfig: any; }, articleId: any) {
  const fragment = `
    <wss:getArticleDetails soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <callContext xsi:type="wss:CAdxCallContext">
        <codeLang xsi:type="xsd:string">${callContext.codeLang}</codeLang>
        <poolAlias xsi:type="xsd:string">${callContext.poolAlias}</poolAlias>
        <poolId   xsi:type="xsd:string">${callContext.poolId || ''}</poolId>
        <requestConfig xsi:type="xsd:string">${callContext.requestConfig}</requestConfig>
      </callContext>
      <articleId xsi:type="xsd:string">${articleId}</articleId>
    </wss:getArticleDetails>
  `;

  const bodyNode = await callSoapOperation('getArticleDetails', fragment);
  const detailsReturn = bodyNode['wss:getArticleDetailsResponse']['getArticleDetailsReturn'];
  return JSON.parse(detailsReturn);
}
