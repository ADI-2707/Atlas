import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidgetRegistry } from '@atlas/widgets';

export interface DashboardProps {
  registry: WidgetRegistry;
  initialLayout?: GridLayout.Layout[];
  onLayoutChange?: (layout: GridLayout.Layout[]) => void;
  isEditable?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ registry, initialLayout, onLayoutChange, isEditable = true }) => {
  const [layout, setLayout] = useState<GridLayout.Layout[]>(initialLayout || []);
  const [availableWidgets] = useState(registry.getAll());

  useEffect(() => {
    if (!initialLayout || initialLayout.length === 0) {
      // Create a default layout if none exists
      const defaultLayout = availableWidgets.map((widget, i) => ({
        i: widget.id,
        x: (i * 4) % 12,
        y: Math.floor(i / 3) * 4,
        w: widget.defaultWidth || 4,
        h: widget.defaultHeight || 4,
        minW: widget.minWidth || 2,
        minH: widget.minHeight || 2
      }));
      setLayout(defaultLayout);
    }
  }, [availableWidgets, initialLayout]);

  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  return (
    <div style={{ width: '100%', minHeight: '500px' }}>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditable}
        isResizable={isEditable}
        draggableCancel="button, input, a, select, textarea"
      >
        {layout.map(item => {
          const widget = registry.get(item.i);
          if (!widget) return null;
          const WidgetComponent = widget.component;
          
          return (
            <div key={item.i} style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface-primary)', borderRadius: '8px', padding: '1rem', overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{widget.name}</div>
              <WidgetComponent />
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};
