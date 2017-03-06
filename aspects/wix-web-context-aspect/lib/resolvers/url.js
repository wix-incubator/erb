const proto = headers => url => headers['x-forwarded-proto'] === 'https' ? url.replace(/^http:/, 'https:') : url; 
  
module.exports.resolve = (headers, url) => {
  const effectiveUrl = headers['x-wix-forwarded-url'] || url;
  return proto(headers)(effectiveUrl);
};
