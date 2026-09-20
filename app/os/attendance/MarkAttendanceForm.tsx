"use client";

import { useMemo, useState, type FormEvent } from "react";
import { GROUPS, addAttendance, groupMenuOption } from "../_data";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";
import OsConfirm from "../_components/OsConfirm";
import SelectMenu from "../../components/ui/SelectMenu";

export default function MarkAttendanceForm() {
  const { t } = useOsT();
  const { session } = useOs();
  const groups = useMemo(
    () => (session?.role === "teacher" ? GROUPS.filter((g) => g.teacherId === session.personId) : GROUPS.filter((g) => g.schoolId === "tas")),
    [session],
  );
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  const [present, setPresent] = useState(group?.students ?? 0);
  const [absent, setAbsent] = useState(0);
  const [late, setLate] = useState(0);
  const [done, setDone] = useState("");
  const [ask, setAsk] = useState(false);

  function onGroup(id: string) {
    setGroupId(id);
    const next = groups.find((g) => g.id === id);
    if (next) {
      setPresent(next.students);
      setAbsent(0);
      setLate(0);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!group) return;
    setAsk(true);
  }

  function confirmMark() {
    if (!group) return;
    setAsk(false);
    const date = new Date().toISOString().slice(0, 10);
    addAttendance({
      date,
      groupId: group.id,
      present: Math.max(0, present),
      absent: Math.max(0, absent),
      late: Math.max(0, late),
    });
    setDone(group.name);
  }

  if (!groups.length) return <p className="os-muted">Aucun groupe à pointer.</p>;

  return (
    <>
      <form className="os-form-stack" onSubmit={submit}>
        <label className="os-field">
          <span>Groupe</span>
          <SelectMenu
            value={groupId}
            onChange={onGroup}
            searchable
            options={groups.map(groupMenuOption)}
          />
        </label>
        <label className="os-field">
          <span>Présents</span>
          <input className="os-input" type="number" min={0} value={present} onChange={(ev) => setPresent(Number(ev.target.value))} required />
        </label>
        <label className="os-field">
          <span>Absents</span>
          <input className="os-input" type="number" min={0} value={absent} onChange={(ev) => setAbsent(Number(ev.target.value))} required />
        </label>
        <label className="os-field">
          <span>Retards</span>
          <input className="os-input" type="number" min={0} value={late} onChange={(ev) => setLate(Number(ev.target.value))} required />
        </label>
        <button type="submit" className="os-btn os-btn-primary">
          {t.teacher.markAttendance}
        </button>
      </form>
      {done ? <p className="os-small os-muted">Présences enregistrées pour {done}.</p> : null}
      <OsConfirm
        open={ask}
        title="Enregistrer les présences"
        body="Confirmez le pointage de ce groupe."
        onConfirm={confirmMark}
        onCancel={() => setAsk(false)}
      />
    </>
  );
}
