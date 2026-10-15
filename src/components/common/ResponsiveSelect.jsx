import { Children, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export default function ResponsiveSelect({ children, value, onChange, disabled, name, required, className = '', ...props }) {
  const options = Children.toArray(children).map(child => ({
    value: String(child.props.value ?? child.props.children),
    label: child.props.children,
    disabled: child.props.disabled,
  }));
  const selected = options.findIndex(option => option.value === String(value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({});
  const trigger = useRef(null);
  const menu = useRef(null);
  const id = useId();
  const search = useRef({ text: '', time: 0 });
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const left = viewport?.offsetLeft || 0;
      const height = viewport?.height || window.innerHeight;
      const width = viewport?.width || window.innerWidth;
      const below = top + height - rect.bottom - 12;
      const above = rect.top - top - 12;
      const upward = below < 180 && above > below;
      setPosition({ position: 'fixed', left: Math.max(left + 8, Math.min(rect.left, left + width - rect.width - 8)), width: Math.min(rect.width, width - 16), maxHeight: Math.max(44, Math.min(260, upward ? above : below)), top: upward ? undefined : rect.bottom + 5, bottom: upward ? window.innerHeight - rect.top + 5 : undefined });
    };
    const outside = event => {
      if (!trigger.current.contains(event.target) && !menu.current?.contains(event.target)) setOpen(false);
    };
    place();
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place);
    };
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => { if (open) menu.current?.querySelector('[data-active=true]')?.scrollIntoView({ block: 'nearest' }); }, [active, open]);

  const choose = index => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange?.({ target: { name, value: option.value }, currentTarget: { name, value: option.value } });
    setOpen(false);
    trigger.current.focus();
  };
  const show = () => { setActive(selected >= 0 && !options[selected].disabled ? selected : enabled[0] ?? 0); setOpen(true); };
  return <div className="responsive-select">
    <select className="responsive-select-native" name={name} value={value} required={required} disabled={disabled} tabIndex={-1} aria-hidden="true" onChange={onChange}
      onInvalid={event => { event.preventDefault(); trigger.current.focus(); show(); }}>{children}</select>
    <button {...props} type="button" ref={trigger} className={'responsive-select-trigger ' + className} disabled={disabled || !options.length}
      role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} aria-required={required}
      aria-activedescendant={open ? `${id}-${active}` : undefined}
      onClick={() => open ? setOpen(false) : show()} onBlur={() => setOpen(false)}
      onKeyDown={event => {
        if (event.key === 'Escape' || event.key === 'Tab') { setOpen(false); return; }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          if (!open) { show(); return; }
          const current = enabled.indexOf(active);
          setActive(event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1) : enabled[(current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length] ?? 0);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (open) choose(active); else show();
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const now = Date.now();
          search.current = { text: (now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase(), time: now };
          const match = options.findIndex(option => !option.disabled && String(option.label).toLowerCase().startsWith(search.current.text));
          if (!open) show();
          if (match >= 0) setActive(match);
        }
      }}><span>{options[selected]?.label ?? 'Select an option'}</span><ChevronDown size={16}/></button>
    {open && createPortal(<div ref={menu} id={id} role="listbox" aria-label={props['aria-label']} className="responsive-select-menu" style={position}>
      {options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option" aria-selected={selected === index} aria-disabled={!!option.disabled} data-active={active === index}
        onPointerDown={event => event.preventDefault()} onMouseMove={() => { if (!option.disabled) setActive(index); }} onClick={() => choose(index)}>
        <span>{option.label}</span>{selected === index && <Check size={16}/>} </div>)}
    </div>, document.body)}
  </div>;
}
