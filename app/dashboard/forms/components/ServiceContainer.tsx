'use client';

import { useState, useCallback } from 'react';
import { Products } from '@/app/services/data/products';
import { ServiceCard } from './ServiceCard';
import { ExpandedView } from './ExpandedView';

// Import all form components
import CIPCAnnualReturnFiling from '@/app/dashboard/forms/[1]cipc-annual-return-filing/Form';
import COIDAWCR from '@/app/dashboard/forms/[2]coida-workmens-compensation-registration/Form';
import COIDAROE from '@/app/dashboard/forms/[3]coida-workmens-compensation-return-of-earnings/Form';
import BBBEE from '@/app/dashboard/forms/[4]bbbee-affidavits-eme-and-qse/Form';
import TrustFormationForm from '@/app/dashboard/forms/[5]formation-of-trust/Form';
import NewRegisteredCompanyForm from '@/app/dashboard/forms/[6]newly-registered-company-pty-ltd/Form';
import ChangeOFCompanyName from '@/app/dashboard/forms/[7]change-of-company-name/Form';
import DSDRegistration from '@/app/dashboard/forms/[8]department-of-social-development-registration/Form';
import CSDProfileRegistatio from '@/app/dashboard/forms/[9]csd-profile-registration/Form';
import FormationOfIncorporation from '@/app/dashboard/forms/[10]formation-of-incorporation/Form';
import ChangeOfRegisteredAddressForm from '@/app/dashboard/forms/[11]change-of-registered-address/Form';
import CIPCIncorporationDocumentsForm from '@/app/dashboard/forms/[12]cipc-incorporation-documents-post-2012/Form';
import ChangeOfDirectorsMemmbers from '@/app/dashboard/forms/[13]change-of-directors-or-members/Form';
import SARSObjectionAppealForm from '@/app/dashboard/forms/[14]sars-notice-of-objection-appeal/Form';
import SARSTaxReturnsForm from '@/app/dashboard/forms/[15]sars-company-cc-trust-tax-returns/Form';
import DepartmentOfLabouruifregistration from '@/app/dashboard/forms/[16]department-of-labour-uif-registration/Form';
import SarsPayeSdlRegistration from '@/app/dashboard/forms/[17]sars-paye-sdl-registration/Form';
import SARSNonProfitTaxExemptionForm from '@/app/dashboard/forms/[18]sars-non-profit-organization-income-tax-exemption/Form';
import EFilingProfileRegistrationForm from '@/app/dashboard/forms/[19]efiling-profile-registration/Form';
import VATRegistrationForm from '@/app/dashboard/forms/[20]vat-registration/Form';
import SARSCustomsRegistrationForm from '@/app/dashboard/forms/[21]sars-customs-registration/Form';
import SARSRegisteredRepresentativeForm from '@/app/dashboard/forms/[22]sars-registered-representative/Form';
import SARSPersonalIncomeTaxReturnsForm from '@/app/dashboard/forms/[23]sars-personal-income-tax-returns/Form';
import ManagementAccountsForm from '@/app/dashboard/forms/[24]management-accounts/Form';
import AnnualFinancialStatementsForm from '@/app/dashboard/forms/[25]annual-financial-statements/Form';

interface ServiceContainerProps {
  serviceId: string;
  orderFound: boolean;
  onSubmissionSuccess: () => void;
}

const formComponents: { [key: string]: React.ComponentType<any> } = {
  '1': CIPCAnnualReturnFiling,
  '2': COIDAWCR,
  '3': COIDAROE,
  '4': BBBEE,
  '5': TrustFormationForm,
  '6': NewRegisteredCompanyForm,
  '7': ChangeOFCompanyName,
  '8': DSDRegistration,
  '9': CSDProfileRegistatio,
  '10': FormationOfIncorporation,
  '11': ChangeOfRegisteredAddressForm,
  '12': CIPCIncorporationDocumentsForm,
  '13': ChangeOfDirectorsMemmbers,
  '14': SARSObjectionAppealForm,
  '15': SARSTaxReturnsForm,
  '16': DepartmentOfLabouruifregistration,
  '17': SarsPayeSdlRegistration,
  '18': SARSNonProfitTaxExemptionForm,
  '19': EFilingProfileRegistrationForm,
  '20': VATRegistrationForm,
  '21': SARSCustomsRegistrationForm,
  '22': SARSRegisteredRepresentativeForm,
  '23': SARSPersonalIncomeTaxReturnsForm,
  '24': ManagementAccountsForm,
  '25': AnnualFinancialStatementsForm,
};

export function ServiceContainer({
  serviceId,
  orderFound,
  onSubmissionSuccess,
}: ServiceContainerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpand = (index: number) => {
    setExpandedIndex(index);
  };

  const handleCollapse = () => {
    setExpandedIndex(null);
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
    handleCollapse();
    onSubmissionSuccess();
  }, [onSubmissionSuccess]);

  const filteredProduct = Products.find((product) => product.id === Number(serviceId));

  if (!orderFound || !filteredProduct || !formComponents[serviceId]) {
    return null;
  }

  const FormComponent = formComponents[serviceId];

  const serviceCardProduct = {
    id: filteredProduct.id,
    name: filteredProduct.name,
    thumbnail: {
      src: filteredProduct.thumbnail,
    },
  };

  return (
    <div key={refreshKey}>
      <ServiceCard product={serviceCardProduct} onClick={() => handleExpand(0)} />
      {expandedIndex !== null && (
        <ExpandedView product={filteredProduct} onClose={handleCollapse}>
          <FormComponent onSubmissionSuccess={handleRefresh} />
        </ExpandedView>
      )}
    </div>
  );
}
