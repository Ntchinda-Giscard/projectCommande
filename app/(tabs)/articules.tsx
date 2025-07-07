import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { encode } from 'base-64';

// Fonction de parsing du format Sage X3
const parseSageExportXML = (raw: string, limit = Infinity) => {
  const clean = raw
    .replace(/<\/?p:[^>]*>/g, '')      // Supprime <p:...> tags
    .replace(/\|/g, '')                // Supprime tous les pipes
    .replace(/<S>.*?<\/S>/gs, '')      // Supprime sections <S>...</S>
    .trim();

  const items = [];
  const recordRegex = /<I>(.*?)<\/I>/gs;
  let match;

  while ((match = recordRegex.exec(clean)) !== null) {
    const record = match[1];
    const obj = {};
    const fieldRegex = /<([^>]+)>(.*?)<\/\1>/g;
    let field;
    while ((field = fieldRegex.exec(record)) !== null) {
      const tag = field[1].trim();
      let value = field[2].trim();
      value = value.replace(/~~[A-Z]{3}/g, '').trim();
      obj[tag] = value;
    }
    items.push(obj);
    if (items.length >= limit) break;
  }
  return items;
};

const SoapRequestComponent = () => {
  useEffect(() => { runSoapRequest(); }, []);

  const runSoapRequest = async () => {
    const url = 'http://192.168.2.107:8124/soap-generic/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC';
    const username = 'admin';
    const password = 'admin';
    const authToken = encode(`${username}:${password}`);

    const soapBody = `
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
        <requestConfig xsi:type="xsd:string">
          adxwss.beautify=true&amp;adxwss.optreturn=JSON&amp;adxwss.maxrows=10
        </requestConfig>
      </callContext>
      <publicName xsi:type="xsd:string">AOWSEXPORT</publicName>
      <inputXml xsi:type="xsd:string">
        {"GRP1":{"I_MODEXP":"XLMITM","I_CHRONO":"NO"},"GRP2":[{"I_TCRITERE":""}],"GRP3":{"I_EXEC":"REALTIME","I_RECORDSEP":"|"}}
      </inputXml>
    </wss:run>
  </soapenv:Body>
</soapenv:Envelope>`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'Authorization': `Basic ${authToken}`,
          'SOAPAction': 'run'
        },
        body: soapBody,
      });

      const text = await response.text();

      const start = text.indexOf('<I>|');
      const endTag = '</p:WWIMPXLMITM>|';
      const end = text.indexOf(endTag, start) + endTag.length;
      const rawXmlBlock = (start >= 0 && end >= start) ? text.substring(start, end) : '';

      if (rawXmlBlock) {
        const parsed = parseSageExportXML(rawXmlBlock, 10);
        console.log('📘 Résultat Sage X3 formaté (max 10):');
        console.log(JSON.stringify(parsed, null, 2));
      } else {
        console.warn('❗ Impossible de localiser le bloc XML brut.');
      }
    } catch (err) {
      console.error('❌ SOAP ERROR:', err);
    }
  };

  return (<View style={{ padding: 20 }}><Text>Envoi SOAP…</Text></View>);
};

export default SoapRequestComponent;
