import CardSimple from 'components/user/shared/cards/cardSimple';
import PageHeader from 'components/user/shared/PageHeader';
import FormIaSettings from 'components/user/pages/profile/editIaSettings/formIaSettings';

export default function EditIaSettings() {
  return (
    <div className="font-work-sans space-y-6 pb-8">
      <PageHeader />

      <CardSimple>
        <div className="w-full">
          <FormIaSettings />
        </div>
      </CardSimple>
    </div>
  );
}
