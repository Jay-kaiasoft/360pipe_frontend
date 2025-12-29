import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { changeClosePlanStatus, validateToken } from "../../service/closePlanService/closePlanService";
import Button from "../../components/common/buttons/button";
import { getAllClosePlanNotes, saveClosePlanNote } from "../../service/closePlanNotes/closePlanNotesService";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import { connect } from "react-redux";
import CustomIcons from "../../components/common/icons/CustomIcons";

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

const formatDateTime = (date) => {
    if (!date) return "";
    try {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
};

const EmptyComments = () => (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        No comments yet. Be the first to ask a question or leave a note.
    </div>
);

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

// ---------- main ----------
const Closeplan = ({ setAlert }) => {
    const { token } = useParams();

    const [loading, setLoading] = useState(true);
    const [closePlan, setClosePlan] = useState(null);

    const [looksPerfect, setLooksPerfect] = useState(false)
    const [isComment, setIsComment] = useState(false)
    const [isCommentDisabled, setIsCommentDisabled] = useState(false)

    const [comments, setComments] = useState([]);
    const [contactId, setContactId] = useState(null)
    const [closePlanCreatedById, setClosePlanCreatedById] = useState(null)
    const [commentText, setCommentText] = useState("")
    const [closePlanId, setClosePlanId] = useState(null)

    const handleValidateToken = async () => {
        setLoading(true);
        try {
            const res = await validateToken(token);

            // ✅ adjust these lines if your API shape is different
            // common patterns: res.result / res.data / res.data.result
            const data = res?.result?.data

            if (res?.status === 200 && data) {
                setLooksPerfect(data?.status ? true : false)
                if (data?.status) {
                    setIsCommentDisabled(true)
                }
                setClosePlanCreatedById(data?.createdBy)
                setContactId(data?.contactId)
                setClosePlanId(data?.closePlanId)

                handleGetAllComments(data?.closePlanId, data?.contactId)
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

    const handleGetAllComments = async (closePlanId, contactId) => {
        const res = await getAllClosePlanNotes(closePlanId, contactId)
        if (res.status === 200) {
            setComments(res.result)
            if (res.result?.length > 0) {
                setIsComment(true)
            }
        }
    }

    const handleSaveComment = async () => {
        const payload = {
            sendTo: closePlanCreatedById,
            createdBy: contactId,
            comments: commentText,
            closePlanId: closePlanId
        }
        const res = await saveClosePlanNote(payload)
        if (res?.status === 201) {
            setCommentText("")
            setAlert({
                open: true,
                message: "Comment added successfully",
                type: "success"
            })
            handleGetAllComments(closePlanId, contactId)
        } else {
            setAlert({
                open: true,
                message: res?.message,
                type: "error"
            })
        }
    }

    const handleSaveStatus = async () => {
        if (!looksPerfect) {
            setIsComment(false)
            const res = await changeClosePlanStatus(closePlanId);
            if (res.status === 200) {
                setLooksPerfect(true)
                setIsCommentDisabled(true)
                setAlert({
                    open: true,
                    message: "Reply send successfully",
                    type: "success"
                })
            } else {
                setLooksPerfect(false)
                setAlert({
                    open: true,
                    message: "Server error",
                    type: "error"
                })
            }
        }
    }

    useEffect(() => {
        document.title = "ClosePlan - 360Pipe"
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
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
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
                        {/* main grid like image */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="grid gap-4 lg:col-span-8">
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
                            </div>

                            <div className="lg:col-span-4">
                                <div className="relative max-w-md bg-[#E9DDFF] rounded-[28px] px-6 py-5 shadow-sm border-2 border-[#4B5563]">

                                    <div className="absolute inset-2 rounded-[22px] border-2 border-dashed border-white pointer-events-none"></div>

                                    <div className="relative z-10">
                                        <p className="font-semibold text-[#242424] text-base">
                                            {closePlan?.contactName},
                                        </p>

                                        <p className="my-2 text-sm text-[#242424] leading-relaxed">
                                            {closePlan?.textMessage}
                                        </p>

                                        <p className="font-semibold text-[#242424] text-base">
                                            {closePlan?.createdByName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3 mt-10">
                                    <div className="flex justify-start items-center gap-2">
                                        <CustomIcons iconName={'fa-solid fa-thumbs-up'} css='cursor-pointer text-yellow-500 h-4 w-4' />
                                        <Button useFor={looksPerfect ? "success" : ""} text={"Looks Perfect"} onClick={() => handleSaveStatus()} />
                                    </div>
                                    <Button disabled={isCommentDisabled} useFor={isComment ? "" : "primary"} text={"Comment / Suggestion"} onClick={() => setIsComment(true)} />
                                </div>
                                {
                                    (isComment && !looksPerfect) && (
                                        <>
                                            <Card title="Leave comment / Question">
                                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                                    <textarea
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        rows={4}
                                                        className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none"
                                                        placeholder="Ask a question or leave a comment…"
                                                    />
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Button text={"Submit"} onClick={() => handleSaveComment()} />
                                                </div>
                                            </Card>

                                            <div className="mt-3">
                                                <Card
                                                    title="Comments"
                                                    right={
                                                        <Pill>
                                                            {comments?.length || 0} {comments?.length === 1 ? "comment" : "comments"}
                                                        </Pill>
                                                    }
                                                >
                                                    {!comments?.length ? (
                                                        <EmptyComments />
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {comments?.map((c, idx) => {
                                                                // Try multiple field names safely (adjust if your API uses different keys)
                                                                const noteText = c?.comments || "";
                                                                const createdAt = c?.createdAt;
                                                                const createdByName = c?.createdByName

                                                                return (
                                                                    <div
                                                                        key={c?.id ?? idx}
                                                                        className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4"
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                                    <div className="font-semibold text-[#242424] text-sm truncate max-w-[220px] sm:max-w-[360px]">
                                                                                        {createdByName}
                                                                                    </div>

                                                                                    {createdAt ? (
                                                                                        <span className="text-xs text-gray-500">
                                                                                            • {formatDateTime(createdAt)}
                                                                                        </span>
                                                                                    ) : null}
                                                                                </div>

                                                                                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                                                    {noteText || "—"}
                                                                                </div>

                                                                                {/* optional: subtle divider line for “thread feel” */}
                                                                                {idx !== comments.length - 1 ? (
                                                                                    <div className="mt-4 h-px w-full bg-gray-100" />
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </Card>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Closeplan)

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
