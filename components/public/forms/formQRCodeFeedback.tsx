import FieldRating from './fields/fieldsQRCode/fieldRating';
import FieldDynamicQuestions from './fields/fieldsQRCode/fieldDynamicQuestions';
import FieldMessage from './fields/fieldsQRCode/fieldMessage';
import FieldCustomerName from './fields/fieldsQRCode/fieldCustomerName';
import FieldCustomerEmail from './fields/fieldsQRCode/fieldCustomerEmail';
import FieldCustomerGender from './fields/fieldsQRCode/fieldCustomerGender';
import type { FormQRCodeFeedbackProps } from './fields/fieldsQRCode/ui.types';
import { FaChevronDown, FaShieldHalved, FaSpinner, FaUser } from 'react-icons/fa6';
import { DEFAULT_COMMENT_FIELD, commentFieldLabel } from 'lib/schemas/public/commentField';

export default function FormQRCodeFeedback({
  model,
}: FormQRCodeFeedbackProps) {
  const {
    formData,
    questions,
    customerData,
    showOptionalFields,
    error,
    isSubmitting,
    commentField,
  } = model.state;
  // Convite padrão, pergunta própria do escopo ou nenhum campo (oculto).
  const commentLabel = commentFieldLabel(commentField ?? DEFAULT_COMMENT_FIELD);

  const {
    updateFormData,
    updateAnswer,
    updateSubanswer,
    updateCustomerData,
    toggleOptionalFields,
    submit,
  } = model.actions;

  return (
    <form onSubmit={submit} className="space-y-5 sm:space-y-6">
      <FieldRating
        rating={formData.rating}
        onRatingChange={(rating) => updateFormData({ rating })}
      />

      <FieldDynamicQuestions
        questions={questions}
        answers={formData.answers}
        subanswers={formData.subanswers}
        onAnswerChange={updateAnswer}
        onSubanswerChange={updateSubanswer}
      />

      {commentLabel && (
        <FieldMessage
          label={commentLabel}
          message={formData.message}
          onMessageChange={(message) => updateFormData({ message })}
        />
      )}

      <div className="rounded-2xl border border-(--quaternary-color)/15 bg-(--bg-secondary) p-3.5 sm:p-4">
        <button
          type="button"
          onClick={toggleOptionalFields}
          aria-expanded={showOptionalFields}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl text-left transition-colors hover:text-(--primary-color) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)">
            <FaUser className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-(--text-primary)">Informações pessoais</span>
            <span className="mt-0.5 block text-xs text-(--text-tertiary)">Nome, e-mail e gênero · Opcional</span>
          </span>
          <FaChevronDown className={`h-4 w-4 shrink-0 text-(--text-tertiary) transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      </div>

      {showOptionalFields && (
        <div className="space-y-4 rounded-2xl border border-(--primary-color)/20 bg-(--primary-color)/5 p-4 sm:p-5">
          <h2 className="font-montserrat text-base font-bold text-(--text-primary)">Seus dados (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldCustomerName
              name={customerData.customer_name || ''}
              onNameChange={(value) => updateCustomerData('customer_name', value)}
            />
            <FieldCustomerEmail
              email={customerData.customer_email || ''}
              onEmailChange={(value) => updateCustomerData('customer_email', value)}
            />
          </div>
          <FieldCustomerGender
            gender={customerData.customer_gender}
            onGenderChange={(value) => updateCustomerData('customer_gender', value)}
          />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 p-3.5">
          <p className="text-(--negative) text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-start gap-2 px-1 text-xs leading-5 text-(--text-tertiary)">
        <FaShieldHalved className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary-color)" aria-hidden />
        <p>Seus dados são protegidos e usados apenas para melhorar sua experiência.</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-(--primary-color) px-6 font-poppins text-sm font-bold text-(--on-primary) shadow-[0_8px_20px_color-mix(in_srgb,var(--primary-color)_22%,transparent)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-(--bg-tertiary) disabled:text-(--text-secondary)">
        {isSubmitting ? (
          <>
            <FaSpinner className="mx-auto animate-spin text-white" aria-hidden="true" />
          </>
        ) : (
          'Enviar Feedback'
        )}
      </button>
    </form>
  );
}
