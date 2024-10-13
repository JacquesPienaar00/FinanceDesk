// components/ZohoSalesIQ.tsx
import Script from 'next/script';

const ZohoSalesIQ: React.FC = () => {
  return (
    <>
      <Script
        id="zoho-salesiq"
        strategy="afterInteractive" // Ensures the script loads after the page is interactive
        dangerouslySetInnerHTML={{
          __html: `
            window.$zoho = window.$zoho || {};
            $zoho.salesiq = $zoho.salesiq || { ready: function() {} };
          `,
        }}
      />
      <Script
        id="zsiqscript"
        src="https://salesiq.zohopublic.com/widget?wc=siq7c1a96b964e9e7777daa59b4996799cc4a3c77d3aabe27a2400e0519e1ab6e40"
        strategy="afterInteractive"
        defer
      />
    </>
  );
};

export default ZohoSalesIQ;