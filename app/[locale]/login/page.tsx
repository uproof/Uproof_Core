import {redirectAuthenticatedInternalUser} from '@/lib/internalAccess';
import CrmLoginPage from '../crm/login/CrmLoginPage';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function InternalLoginLanding({params}: Props) {
  const {locale} = await params;
  await redirectAuthenticatedInternalUser(locale);

  return <CrmLoginPage />;
}
