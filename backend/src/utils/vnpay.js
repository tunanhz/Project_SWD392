const crypto = require('crypto');
const querystring = require('qs');

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createPaymentUrl = (params, secret) => {
    const vnpParams = sortObject(params);
    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnpParams['vnp_SecureHash'] = signed;
    
    return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${querystring.stringify(vnpParams, { encode: false })}`;
};

const verifyReturnUrl = (vnpParams, secret) => {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return secureHash === signed;
};

module.exports = { createPaymentUrl, verifyReturnUrl };
