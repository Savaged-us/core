let QRCode = require('qrcode')
import * as util from 'util';

const qrFunction = util.promisify(QRCode.toDataURL);

export async function promoMakeQRCode( qrCode: string): Promise<string> {
    return await qrFunction(qrCode);
}