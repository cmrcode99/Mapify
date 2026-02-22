"use client";

import { useMemo } from "react";
import { X, Clock, BookOpen, CheckCircle2, XCircle, Users } from "lucide-react";
import {
    getActiveClass,
    getNextClass,
    getClassesForRoomOnDay,
    formatClassTime,
    DAY_LABELS,
    type ClassSession,
} from "@/lib/class-schedules";
import type { RoomInfo } from "./BuildingViewer";

interface RoomDetailPanelProps {
    roomId: string;
    roomInfo?: RoomInfo;
    checkinCount?: number;
    onClose: () => void;
}

function TimeBlock({ session, isActive }: { session: ClassSession; isActive: boolean }) {
    return (
        <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${isActive
                ? "bg-red-500/20 border border-red-500/40"
                : "bg-white/5 border border-white/10"
                }`}
        >
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-300" />
            <div className="min-w-0">
                <p className="font-semibold text-white">{session.course}</p>
                <p className="text-[#aab4cc] truncate">{session.title}</p>
                <p className="text-[#8888bb] mt-0.5">{formatClassTime(session)}</p>
            </div>
            {isActive && (
                <span className="ml-auto shrink-0 rounded bg-red-500/30 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
                    NOW
                </span>
            )}
        </div>
    );
}

function DaySchedule({
    label,
    sessions,
    activeSession,
}: {
    label: string;
    sessions: ClassSession[];
    activeSession: ClassSession | null;
}) {
    return (
        <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-300 mb-1.5">
                {label}
            </h4>
            {sessions.length === 0 ? (
                <p className="text-xs text-[#666699] italic py-1">No classes scheduled</p>
            ) : (
                <div className="space-y-1.5">
                    {sessions.map((s, i) => (
                        <TimeBlock
                            key={`${s.course}-${i}`}
                            session={s}
                            isActive={
                                activeSession !== null &&
                                activeSession.course === s.course &&
                                activeSession.start_hour === s.start_hour &&
                                activeSession.start_min === s.start_min
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RoomDetailPanel({
    roomId,
    roomInfo,
    checkinCount = 0,
    onClose,
}: RoomDetailPanelProps) {
    const now = useMemo(() => new Date(), []);
    const dayOfWeek = now.getDay();
    const tomorrowDow = (dayOfWeek + 1) % 7;

    const activeClass = useMemo(
        () => getActiveClass("ECEB", roomId, now),
        [roomId, now]
    );
    const nextClass = useMemo(
        () => getNextClass("ECEB", roomId, now),
        [roomId, now]
    );
    const todaySessions = useMemo(
        () => getClassesForRoomOnDay("ECEB", roomId, dayOfWeek),
        [roomId, dayOfWeek]
    );
    const tomorrowSessions = useMemo(
        () => getClassesForRoomOnDay("ECEB", roomId, tomorrowDow),
        [roomId, tomorrowDow]
    );

    const isInUse = !!activeClass || checkinCount > 0;

    return (
        <div className="absolute top-14 right-4 z-30 w-72 max-h-[calc(100%-7rem)] bg-[#12122a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-white/10">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-white tracking-wide">
                        Room {roomId}
                    </h3>
                    {roomInfo && (
                        <p className="text-xs text-[#8888bb] truncate">{roomInfo.name}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                    <X className="h-4 w-4 text-[#8888bb]" />
                </button>
            </div>

            {/* Status banner */}
            <div
                className={`mx-4 mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${!isInUse
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/15 border border-red-500/30 text-red-300"
                    }`}
            >
                {!isInUse ? (
                    <>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Available</span>
                    </>
                ) : (
                    <>
                        <XCircle className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                            <span>In Use</span>
                            {activeClass && (
                                <p className="text-xs font-normal text-red-300/80 truncate">
                                    {activeClass.course} — {activeClass.title}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Checkin count */}
            {checkinCount > 0 && (
                <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        <strong className="text-white">{checkinCount}</strong>{" "}
                        {checkinCount === 1 ? "person" : "people"} checked in
                    </span>
                </div>
            )}

            {/* Next class hint */}
            {!isInUse && nextClass && (
                <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-[#aab4cc]">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                    <span>
                        Next: <strong className="text-white">{nextClass.course}</strong> at{" "}
                        {formatClassTime(nextClass).split("–")[0].trim()}
                    </span>
                </div>
            )}

            {/* Scrollable schedule area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
                <DaySchedule
                    label={`Today — ${DAY_LABELS[dayOfWeek]}`}
                    sessions={todaySessions}
                    activeSession={activeClass}
                />
                <DaySchedule
                    label={`Tomorrow — ${DAY_LABELS[tomorrowDow]}`}
                    sessions={tomorrowSessions}
                    activeSession={null}
                />
            </div>
        </div>
    );
}
