import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { validateToken } from "../../service/closePlanService/closePlanService";
import Button from "../../components/common/buttons/button";

// ---------- helpers ----------
const getFileNameFromUrl = (url = "") => {
    try {
        const clean = url.split("?")[0];
        const name = clean.substring(clean.lastIndexOf("/") + 1);
        return decodeURIComponent(name || "File");
    } catch {
        return "File";
    }
};

const getExt = (name = "") => {
    const parts = name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
};

const extMeta = (ext) => {
    if (["pdf"].includes(ext)) return { label: "PDF", icon: "📄" };
    if (["doc", "docx"].includes(ext)) return { label: "DOC", icon: "📝" };
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) return { label: "IMG", icon: "🖼️" };
    if (["xls", "xlsx", "csv"].includes(ext)) return { label: "SHEET", icon: "📊" };
    if (["ppt", "pptx"].includes(ext)) return { label: "PPT", icon: "📽️" };
    return { label: "FILE", icon: "📎" };
};

const splitNextSteps = (text = "") => {
    // supports: newline OR "  " separation OR "1)..." style
    if (!text) return [];
    const byNewLine = text.split("\n").map((s) => s.trim()).filter(Boolean);
    if (byNewLine.length > 1) return byNewLine;

    // if single line, try to split by "  " (double spaces) or " • "
    const byDoubleSpace = text.split("  ").map((s) => s.trim()).filter(Boolean);
    if (byDoubleSpace.length > 1) return byDoubleSpace;

    const byBullet = text.split("•").map((s) => s.trim()).filter(Boolean);
    if (byBullet.length > 1) return byBullet;

    return [text.trim()];
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // fallback
        try {
            const el = document.createElement("textarea");
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            return true;
        } catch {
            return false;
        }
    }
};

// ---------- small UI blocks ----------
const Card = ({ title, right, children, className = "" }) => (
    <div
        className={
            "rounded-2xl border border-gray-200 bg-white shadow-sm " +
            "p-4 sm:p-5 " +
            className
        }
    >
        {(title || right) && (
            <div className="mb-3 flex items-center justify-between gap-3">
                {title ? <h3 className="text-sm font-semibold text-[#242424]">{title}</h3> : <div />}
                {right ? <div>{right}</div> : null}
            </div>
        )}
        {children}
    </div>
);

const Pill = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
        {children}
    </span>
);

const PrimaryBtn = ({ children, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={
            "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold " +
            "bg-[#0478DC] text-white hover:brightness-95 active:brightness-90 " +
            "transition " +
            "disabled:opacity-60 disabled:cursor-not-allowed " +
            className
        }
    >
        {children}
    </button>
);

const OutlineBtn = ({ children, onClick, className = "" }) => (
    <button
        onClick={onClick}
        className={
            "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold " +
            "border border-gray-200 bg-white text-[#242424] hover:bg-gray-50 " +
            "transition " +
            className
        }
    >
        {children}
    </button>
);

// ---------- main ----------
const Closeplan = () => {
    const { token } = useParams();

    const [loading, setLoading] = useState(true);
    const [closePlan, setClosePlan] = useState(null);

    const handleValidateToken = async () => {
        setLoading(true);
        try {
            const res = await validateToken(token);

            // ✅ adjust these lines if your API shape is different
            // common patterns: res.result / res.data / res.data.result
            const data = res?.result?.data

            if (res?.status === 200 && data) {
                setClosePlan(data);
            } else {
                setClosePlan(null);
            }
        } catch (e) {
            setClosePlan(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) handleValidateToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const keyContacts = useMemo(() => {
        return closePlan?.opportunityContactDto || []
    }, [closePlan]);

    const nextSteps = useMemo(() => splitNextSteps(closePlan?.nextSteps || ""), [closePlan]);

    const sharedFiles = useMemo(() => {
        const docs = closePlan?.opportunitiesDocumentsDto || [];
        return docs.map((d) => {
            const name = getFileNameFromUrl(d?.url);
            const ext = getExt(name);
            return {
                id: d?.id,
                url: d?.url,
                name,
                ext,
                meta: extMeta(ext),
            };
        });
    }, [closePlan]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* top bar */}
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* <div className="h-9 w-9 rounded-xl bg-[#7413D1]/10 flex items-center justify-center">
                            <span className="text-[#7413D1] font-black">Q</span>
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-[#242424] leading-4">Customer Deal Portal</div>
                            <div className="text-xs text-gray-500">360Pipe Close Plan</div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* body */}
            <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">                               
                {loading ? (
                    <div className="grid gap-4">
                        <div className="h-28 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                        <div className="h-48 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                        <div className="h-48 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                    </div>
                ) : !closePlan ? (
                    <Card title="Invalid or expired link">
                        <div className="text-sm text-gray-600">
                            We couldn’t load the close plan for this token. Please request a new link from the account team.
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Opportunity</div>
                    <div className="mt-1 text-xl font-extrabold text-[#242424]">
                      {closePlan?.oppName || "—"}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Pill>ClosePlan #{closePlan?.closePlanId}</Pill>
                      <Pill>OppId {closePlan?.oppId}</Pill>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                      Customer Logo
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                      Company Logo
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Account Lead">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-bold">AL</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#242424] truncate">Account Lead</div>
                    <div className="text-xs text-gray-500 truncate">account.lead@example.com</div>
                    <div className="text-xs text-gray-500 truncate">(555) 555-1234</div>
                  </div>
                </div>
              </Card>
            </div> */}

                        {/* main grid like image */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* left column */}
                            <div className="grid gap-4">
                                {/* Executive Summary */}
                                <Card
                                    title="Executive Summary"
                                    right={
                                        <Pill>
                                            AI (first 5 boxes)
                                        </Pill>
                                    }
                                >
                                    {/* businessValue is HTML from backend
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700"
                                        // NOTE: if you want sanitize -> use DOMPurify
                                        dangerouslySetInnerHTML={{ __html: closePlan?.businessValue || "<p>—</p>" }}
                                    /> */}
                                </Card>

                                {/* 2x2 blocks */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Card title="Business Value">
                                        <div
                                            className="prose prose-sm max-w-none text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: closePlan?.businessValue || "<p>—</p>" }}
                                        />
                                    </Card>

                                    <Card title="Time Line">
                                        {closePlan?.decisionMap?.length > 0 ? (
                                            <ul className="space-y-1 text-sm">
                                                {closePlan?.decisionMap?.map(
                                                    (c) => (
                                                        <li key={c.id}>
                                                            <span className="font-medium text-indigo-600">
                                                                {c.process}
                                                            </span>
                                                            {c.processDate && (
                                                                <>
                                                                    <span className="mx-1 text-gray-500">
                                                                        –
                                                                    </span>
                                                                    <span>
                                                                        {c.processDate ? new Date(c.processDate).toLocaleDateString("en-US", {
                                                                            month: "numeric",
                                                                            day: "numeric",
                                                                            year: "numeric",
                                                                        })
                                                                            : "-"}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                Add your key milestones here (e.g., discovery, evaluation, security review, legal, signature).
                                            </div>
                                        )}
                                    </Card>

                                    <Card title="Stakeholders">
                                        {keyContacts?.length ? (
                                            <ul className="space-y-1 text-sm">
                                                {keyContacts?.map(
                                                    (c) => (
                                                        <li key={c.id}>
                                                            <span className="font-medium text-indigo-600">
                                                                {c.contactName}
                                                            </span>
                                                            {c.role && (
                                                                <>
                                                                    <span className="mx-1 text-gray-500">
                                                                        –
                                                                    </span>
                                                                    <span>
                                                                        {c.role}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-600">No key contacts found.</div>
                                        )}
                                    </Card>

                                    <Card
                                        title="Shared Files"
                                        // right={
                                        //     sharedFiles?.length ? (
                                        //         <Pill>{sharedFiles.length} files</Pill>
                                        //     ) : null
                                        // }
                                    >
                                        {sharedFiles?.length ? (
                                            <div className="space-y-2">
                                                {sharedFiles.map((f) => (
                                                    <div
                                                        key={f.id}
                                                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-9 w-9 rounded-xl bg-[#0478DC]/10 flex items-center justify-center">
                                                                <span className="text-[#0478DC]">{f.meta.icon}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold text-[#242424]">
                                                                    {f.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{f.meta.label}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {/* <OutlineBtn
                                                                onClick={async () => {
                                                                    const ok = await copyToClipboard(f.url);
                                                                    showToast(ok ? "Copied!" : "Copy failed");
                                                                }}
                                                            >
                                                                Copy
                                                            </OutlineBtn> */}
                                                            <a
                                                                href={f.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-[#7413D1] text-white hover:brightness-95 transition"
                                                                title="Open"
                                                            >
                                                                Open
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600">No shared files.</div>
                                        )}
                                    </Card>

                                    <Card title="ROI / TCO">
                                        <div className="text-sm text-gray-600">
                                            -
                                            {/* Add ROI/TCO numbers when you have fields (savings, cost, payback period, etc.). */}
                                        </div>
                                    </Card>

                                    <Card title="Next Step(s)">
                                        {nextSteps?.length ? (
                                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                                {nextSteps.map((s, i) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-600">—</div>
                                        )}
                                    </Card>
                                </div>
                             
                                {/* Leave comment/question */}
                                <Card title="Leave comment / Question">
                                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                                        <textarea
                                            rows={4}
                                            className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none"
                                            placeholder="Ask a question or leave a comment…"
                                        />
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                       <Button text={"Submit"}/>                                    
                                    </div>
                                </Card>
                            </div>

                            {/* <div className="grid gap-4">
                <Card title="Key Data">
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Opportunity</span>
                      <span className="font-semibold text-[#242424] text-right truncate max-w-[180px]">
                        {closePlan?.oppName || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">OppId</span>
                      <span className="font-semibold text-[#242424]">{closePlan?.oppId}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">ClosePlanId</span>
                      <span className="font-semibold text-[#242424]">{closePlan?.closePlanId}</span>
                    </div>
                  </div>
                </Card>
              </div> */}
                            {/* Shared Files */}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Closeplan;
