export const sleep = (ms:number) => 
    new Promise( ( resolve) => setTimeout(resolve,ms))

export const generateMockTxHash = () => 
    "0x" + Math.random().toString(16).substring(2,15);
