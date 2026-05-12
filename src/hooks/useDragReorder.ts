import { useCallback, useState, type DragEvent } from 'react';

type DropSide = 'above' | 'below';

interface DragState {
  dragId: string | null;
  overId: string | null;
  side: DropSide | null;
}

interface UseDragReorderArgs<T extends string> {
  ids: readonly T[];
  onReorder: (id: T, toIndex: number) => void;
}

export function useDragReorder<T extends string>({
  ids,
  onReorder,
}: UseDragReorderArgs<T>) {
  const [dragState, setDragState] = useState<DragState>({
    dragId: null,
    overId: null,
    side: null,
  });

  const onDragStart = useCallback(
    (id: T) => (e: DragEvent<HTMLElement>) => {
      setDragState({ dragId: id, overId: null, side: null });
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', id);
      } catch {
        // older browsers
      }
    },
    [],
  );

  const onDragOver = useCallback(
    (id: T) => (e: DragEvent<HTMLElement>) => {
      if (!dragState.dragId || dragState.dragId === id) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const side: DropSide = e.clientY < midpoint ? 'above' : 'below';
      if (dragState.overId !== id || dragState.side !== side) {
        setDragState((prev) => ({ ...prev, overId: id, side }));
      }
    },
    [dragState.dragId, dragState.overId, dragState.side],
  );

  const onDragLeave = useCallback(
    (id: T) => () => {
      setDragState((prev) =>
        prev.overId === id ? { ...prev, overId: null, side: null } : prev,
      );
    },
    [],
  );

  const onDrop = useCallback(
    (id: T) => (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const { dragId, side } = dragState;
      if (!dragId || dragId === id || !side) {
        setDragState({ dragId: null, overId: null, side: null });
        return;
      }
      const targetIndex = ids.indexOf(id);
      const fromIndex = ids.indexOf(dragId as T);
      if (targetIndex < 0 || fromIndex < 0) {
        setDragState({ dragId: null, overId: null, side: null });
        return;
      }
      let toIndex = side === 'above' ? targetIndex : targetIndex + 1;
      if (fromIndex < toIndex) toIndex -= 1;
      onReorder(dragId as T, toIndex);
      setDragState({ dragId: null, overId: null, side: null });
    },
    [dragState, ids, onReorder],
  );

  const onDragEnd = useCallback(() => {
    setDragState({ dragId: null, overId: null, side: null });
  }, []);

  const getRowProps = useCallback(
    (id: T) => ({
      draggable: true,
      onDragStart: onDragStart(id),
      onDragOver: onDragOver(id),
      onDragLeave: onDragLeave(id),
      onDrop: onDrop(id),
      onDragEnd,
      'data-dragging': dragState.dragId === id || undefined,
      'data-drop-above':
        dragState.overId === id && dragState.side === 'above' || undefined,
      'data-drop-below':
        dragState.overId === id && dragState.side === 'below' || undefined,
    }),
    [
      dragState.dragId,
      dragState.overId,
      dragState.side,
      onDragEnd,
      onDragLeave,
      onDragOver,
      onDragStart,
      onDrop,
    ],
  );

  return { getRowProps, dragState };
}
