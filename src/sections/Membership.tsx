// Perron 7, »Billetlugen«: the membership cards and the form. »Klip billet« on a card picks that type and opens the
// form; punching the punched card again takes the punch back and closes the form.

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { CheckIcon } from "../components/Icons";
import { Kicker } from "../components/Kicker";
import { CONTACT_EMAIL, MEMBERSHIP_CARDS, MEMBERSHIP_TEXT } from "../content/site";
import {
  checkApplication,
  MEMBERSHIP_FIELDS,
  MEMBERSHIP_TYPES,
  receiptText,
  sendApplication,
  type Application,
  type FieldName,
  type MembershipErrors,
  type MembershipType,
} from "../lib/membership";

type Step = "cards" | "form" | "sent";

export function Membership({ number }: { number: number }) {
  const [type, setType] = useState<MembershipType | null>(null);
  const [step, setStep] = useState<Step>("cards");
  const [sent, setSent] = useState<Application | null>(null);
  // Bumped each time the form opens, so it scrolls into view and focuses its first field.
  const [opened, setOpened] = useState(0);

  const openForm = (picked?: MembershipType) => {
    if (picked) setType(picked);
    setSent(null);
    setStep("form");
    setOpened((n) => n + 1);
  };

  const punch = (card: MembershipType) => {
    if (type?.id === card.id) {
      setType(null);
      setSent(null);
      setStep("cards");
    } else {
      openForm(card);
    }
  };

  return (
    <section id="bliv-medlem" className="wrap membership">
      <Kicker number={number} colour="var(--lilac)">
        PERRON {number} · BLIV MEDLEM
      </Kicker>
      <h2 className="heading" style={{ color: "var(--lilac)", marginBottom: 8 }}>
        Billetlugen · bliv medlem
      </h2>
      <p className="lead">{MEMBERSHIP_TEXT}</p>
      <div className="cards">
        {MEMBERSHIP_TYPES.map((card) => {
          const { text, colour, tilt } = MEMBERSHIP_CARDS[card.id];
          const punched = type?.id === card.id;
          return (
            <div key={card.id} className="member-card" style={{ "--colour": colour, "--tilt": `${tilt}deg` } as CSSProperties}>
              <div className="member-card-text">
                <div className="member-card-kind">MEDLEMSKORT</div>
                <h3>{card.name}</h3>
                <div className="member-card-price">{card.price}</div>
                <p>{text}</p>
                <button type="button" className="punch-button" aria-pressed={punched} onClick={() => punch(card)}>
                  {punched ? "Fortryd klip" : "Klip billet"}
                </button>
              </div>
              <div className="member-card-stub" aria-hidden="true">
                KUPÉEN 9520
              </div>
              {punched && (
                <>
                  <div className="punch-hole" aria-hidden="true" />
                  <div className="punched-stamp">KLIPPET!</div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {step === "cards" && (
        <button type="button" className="big-button" onClick={() => openForm()}>
          Til medlemsformularen
        </button>
      )}
      {step === "form" && (
        <MembershipForm
          type={type}
          onType={setType}
          opened={opened}
          onClose={() => setStep("cards")}
          onSent={(application) => {
            setSent(application);
            setStep("sent");
          }}
        />
      )}
      {step === "sent" && sent && <Receipt application={sent} onAgain={() => openForm()} />}
    </section>
  );
}

interface FormProps {
  type: MembershipType | null;
  onType: (type: MembershipType) => void;
  opened: number;
  onClose: () => void;
  onSent: (application: Application) => void;
}

function MembershipForm({ type, onType, opened, onClose, onSent }: FormProps) {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<MembershipErrors>({});
  const [notConnected, setNotConnected] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const element = form.current;
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    element.querySelector<HTMLInputElement>('[name="name"]')?.focus({ preventScroll: true });
  }, [opened]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = checkApplication(type, (name) => String(data.get(name) ?? ""));
    if ("errors" in result) {
      setErrors(result.errors);
      setNotConnected(false);
      // Focus goes to the first thing that needs fixing.
      const first = MEMBERSHIP_FIELDS.find((f) => result.errors[f.name]);
      const target = result.errors.type ? form.current?.querySelector<HTMLElement>("[aria-pressed]") : form.current?.querySelector<HTMLElement>(`[name="${first?.name}"]`);
      target?.focus();
      return;
    }
    setErrors({});
    setSending(true);
    const outcome = await sendApplication(result.application);
    setSending(false);
    if (outcome.sent) onSent(result.application);
    else setNotConnected(true);
  };

  // Typing in a field clears its message; the others stay until the next »Send«.
  const clearError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as FieldName | undefined;
    if (name && errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  return (
    <form ref={form} className="ticket-form" onSubmit={submit} onInput={clearError} aria-labelledby="medlem-titel" noValidate>
      <div className="ticket-hole" aria-hidden="true" />
      <div className="ticket-hole right" aria-hidden="true" />
      <div className="ticket-kind">BILLETLUGEN · MEDLEMSFORMULAR</div>
      <h3 id="medlem-titel">Kupéen → Medlem</h3>
      <p>Udfyld formularen, så sender vi en faktura til din email.</p>
      <fieldset>
        <legend>MEDLEMSTYPE</legend>
        <div className="type-buttons">
          {MEMBERSHIP_TYPES.map((t) => {
            const pressed = type?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className="type-button"
                aria-pressed={pressed}
                aria-describedby={errors.type ? "medlem-type-fejl" : undefined}
                style={{ "--colour": MEMBERSHIP_CARDS[t.id].colour } as CSSProperties}
                onClick={() => {
                  onType(t);
                  setErrors({ ...errors, type: undefined });
                }}
              >
                {pressed && <CheckIcon />}
                {t.name}
                <span>{t.price}</span>
              </button>
            );
          })}
        </div>
        {errors.type && (
          <p id="medlem-type-fejl" className="field-error" style={{ marginTop: 8 }}>
            {errors.type}
          </p>
        )}
      </fieldset>
      <div className="fields">
        {MEMBERSHIP_FIELDS.map((f) => {
          const error = errors[f.name];
          return (
            <div key={f.name} className={f.full ? "field full" : "field"}>
              <label htmlFor={`medlem-${f.name}`}>{f.label}</label>
              <input
                id={`medlem-${f.name}`}
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `medlem-${f.name}-fejl` : undefined}
              />
              {error && (
                <p id={`medlem-${f.name}-fejl`} className="field-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {notConnected && (
        <p className="form-error" role="alert">
          Formularen kan ikke sendes herfra endnu. Skriv i stedet til <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> med dit navn, din
          adresse og den medlemstype, du ønsker, så sender vi en faktura.
        </p>
      )}
      <div className="form-actions">
        <button type="submit" className="send-button" disabled={sending}>
          Send
        </button>
        <button type="button" className="text-button" onClick={onClose}>
          Luk formularen
        </button>
      </div>
    </form>
  );
}

function Receipt({ application, onAgain }: { application: Application; onAgain: () => void }) {
  const receipt = useRef<HTMLDivElement>(null);
  useEffect(() => receipt.current?.focus({ preventScroll: true }), []);
  return (
    <div ref={receipt} className="receipt" role="status" tabIndex={-1}>
      <div className="ticket-hole" aria-hidden="true" />
      <div className="ticket-hole right" aria-hidden="true" />
      <div className="ticket-kind">BILLETLUGEN · KVITTERING</div>
      <div className="receipt-head">
        <h3>Tak, {application.values.name.split(/\s+/)[0]}!</h3>
        <span className="sent-stamp" aria-hidden="true">
          SENDT!
        </span>
      </div>
      <p>{receiptText(application)}</p>
      <button type="button" className="again-button" onClick={onAgain}>
        Udfyld en ny
      </button>
    </div>
  );
}
