import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'http://192.168.2.107:8124/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl',  // ← your SOAP endpoint
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8',
  },
});