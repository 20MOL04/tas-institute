"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { GateChrome } from "../_components/GateChrome";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";
import { SPACE_HOME, lookupAccount, type Space } from "../_data/auth";

const SPACES: Space[] = ["ceo", "admin", "teacher", "student"];

const PLACEHOLDER: Record<Space, string> = {
  ceo: "CEO-26-0001",
  admin: "ADM-26-0001",
  teacher: "ENS-26-0001",
  student: "TAS-26-0001",
};

function isSpace(v: string | null): v is Space {
  return !!v && (SPACES as string[]).includes(v);
}

function LoginForm() {
  const { t } = useOsT();
  const router = useRouter();
  const params = useSearchParams();
  const space: Space = isSpace(params.get("space")) ? (params.get("space") as Space) : "student";
  const { hasPassword, setPassword, checkPassword, signIn } = useOs();

  const [matricule, setMatricule] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const account = useMemo(() => lookupAccount(matricule, space), [matricule, space]);
  const first = account ? !hasPassword(account.matricule, account.firstLoginDefault) : false;
  const spaceTitle = t.gate[space === "admin" ? "admin" : space].title;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!account) {
      setError(t.login.unknown);
      return;
    }
    if (first) {
      if (password.length < 6) {
        setError(t.login.short);
        return;
      }
      if (password !== confirm) {
        setError(t.login.mismatch);
        return;
      }
      setPassword(account.matricule, password);
      signIn(account);
      router.push(SPACE_HOME[space]);
      return;
    }
    if (!checkPassword(account.matricule, password, account.firstLoginDefault)) {
      setError(t.login.wrong);
      return;
    }
    signIn(account);
    router.push(SPACE_HOME[space]);
  }

  return (
    <form className="os-login" onSubmit={onSubmit}>
      <h1>
        {first ? t.login.firstTitle : t.login.title}
        <span>{spaceTitle}</span>
      </h1>

      <label className="os-field">
        <span>{t.login.matricule}</span>
        <input
          className="os-input"
          value={matricule}
          onChange={(e) => {
            setMatricule(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder={PLACEHOLDER[space]}
          autoComplete="username"
          required
        />
      </label>

      {account ? (
        <p className="os-hello">
          {t.login.hello}, <strong>{account.name}</strong>
        </p>
      ) : null}

      <label className="os-field">
        <span>{t.login.password}</span>
        <input
          className="os-input"
          type="password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          autoComplete={first ? "new-password" : "current-password"}
          required
        />
      </label>

      {first ? (
        <label className="os-field">
          <span>{t.login.confirm}</span>
          <input
            className="os-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
      ) : null}

      {error ? <p className="os-field-error">{error}</p> : null}

      <button type="submit" className="os-btn os-btn-primary os-login-submit" disabled={!account || !password}>
        {first ? t.login.create : t.login.submit}
      </button>

      <div className="os-login-foot">
        <Link href={`/os/forgot?space=${space}`}>{t.login.forgot}</Link>
        <Link href="/os">{t.login.back}</Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <GateChrome>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GateChrome>
  );
}
