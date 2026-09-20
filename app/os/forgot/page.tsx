"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { GateChrome } from "../_components/GateChrome";
import { useOsT } from "../_components/useOsT";
import { lookupAccount, type Space } from "../_data/auth";

function ForgotForm() {
  const { t } = useOsT();
  const space = (useSearchParams().get("space") as Space) || "student";
  const [matricule, setMatricule] = useState("");
  const [sent, setSent] = useState(false);
  const account = lookupAccount(matricule, space);

  return (
    <form
      className="os-login"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <h1>{t.forgot.title}</h1>
      <label className="os-field">
        <span>{t.login.matricule}</span>
        <input
          className="os-input"
          value={matricule}
          onChange={(e) => {
            setMatricule(e.target.value.toUpperCase());
            setSent(false);
          }}
          required
        />
      </label>
      {account ? (
        <p className="os-hello">
          {t.login.hello}, <strong>{account.name}</strong>
        </p>
      ) : null}
      {sent ? <p className="os-hello">{t.forgot.sent}</p> : null}
      <button type="submit" className="os-btn os-btn-primary" style={{ width: "100%" }}>
        {t.forgot.send}
      </button>
      <div className="os-login-foot">
        <Link href={`/os/login?space=${space}`}>{t.forgot.back}</Link>
      </div>
    </form>
  );
}

export default function ForgotPage() {
  return (
    <GateChrome>
      <Suspense fallback={<p className="os-muted">…</p>}>
        <ForgotForm />
      </Suspense>
    </GateChrome>
  );
}
