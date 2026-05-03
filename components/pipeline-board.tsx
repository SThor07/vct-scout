"use client"

import { useState, useTransition } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import Link from "next/link"

import { PIPELINE_STATUSES, type PipelineStatus } from "@/lib/constants"
import { PIPELINE_COLOR, ROLE_COLOR } from "@/lib/colors"
import type { Player } from "@/lib/types"
import { updatePipelineStatus } from "@/app/(dashboard)/players/actions"
import { cn } from "@/lib/utils"

function PlayerCard({ p, dragging }: { p: Player; dragging?: boolean }) {
  const roleColor = ROLE_COLOR[p.role]
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-3 shadow-sm select-none cursor-grab",
        "hover:border-primary/40 transition-colors",
        dragging && "opacity-50"
      )}
      style={{ borderLeft: `3px solid ${roleColor}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/players/${p.id}`}
          className="text-base font-semibold hover:text-primary truncate"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {p.name}
        </Link>
        <span className="hud-num text-lg">{p.acs?.toFixed(0) ?? "—"}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.15em]"
          style={{ background: `${roleColor}22`, color: roleColor }}
        >
          {p.role}
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.15em] bg-accent text-secondary-fg">
          {p.sub_region}
        </span>
        {p.contract_status === "Free Agent" && (
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ background: "rgba(0, 255, 148, 0.12)", color: "#00FF94" }}
          >
            FA
          </span>
        )}
      </div>
      {p.current_team && (
        <div className="text-xs text-secondary-fg mt-2 truncate">
          {p.current_team}
        </div>
      )}
    </div>
  )
}

function DraggableCard({ p }: { p: Player }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: p.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <PlayerCard p={p} dragging={isDragging} />
    </div>
  )
}

function Column({
  status,
  players,
}: {
  status: PipelineStatus
  players: Player[]
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status })
  const color = PIPELINE_COLOR[status]
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-sidebar/50 p-3 min-w-[260px] flex-1",
        "transition-colors",
        isOver && "border-primary/60 bg-primary/5"
      )}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-center justify-between px-1 py-1">
        <span
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {status}
        </span>
        <span
          className="hud-num px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: `${color}1F`, color }}
        >
          {players.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 min-h-[40px]">
        {players.map((p) => (
          <DraggableCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  )
}

export function PipelineBoard({ players: initial }: { players: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(initial)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const target = e.over?.id
    if (!target) return
    const newStatus = String(target) as PipelineStatus
    if (!PIPELINE_STATUSES.includes(newStatus)) return

    const id = String(e.active.id)
    const player = players.find((p) => p.id === id)
    if (!player || player.pipeline_status === newStatus) return

    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pipeline_status: newStatus } : p))
    )

    startTransition(async () => {
      try {
        await updatePipelineStatus(id, newStatus)
      } catch {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, pipeline_status: player.pipeline_status } : p
          )
        )
      }
    })
  }

  const active = activeId ? players.find((p) => p.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {PIPELINE_STATUSES.map((s) => (
          <Column
            key={s}
            status={s}
            players={players.filter((p) => p.pipeline_status === s)}
          />
        ))}
      </div>
      <DragOverlay>{active ? <PlayerCard p={active} /> : null}</DragOverlay>
    </DndContext>
  )
}
