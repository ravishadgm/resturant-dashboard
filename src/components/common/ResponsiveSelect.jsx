import { Children, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export default function ResponsiveSelect({ children, value, onChange, name, disabled, required, className = '', ...props }) {
  const options = Children.toArray(children).map(child => ({ value: String(child.props.value ?? child.props.children), label: child.props.children, disabled: child.props.disabled }));
  const selected = options.findIndex(option => option.value === String(value));
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const search = useRef({ text: '', time: 0 });
  const id = useId();

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const left = viewport?.offsetLeft || 0;
      const height = viewport?.height || window.innerHeight;
      const width = viewport?.width || window.innerWidth;
      const below = Math.max(0, top + height - rect.bottom - 12);
      const above = Math.max(0, rect.top - top - 12);
      const upward = below < Math.min(260, options.length * 44 + 12) && above > below;
      const menuWidth = Math.min(rect.width, width - 16);
      setPosition({ left: Math.max(left + 8, Math.min(rect.left, left + width - menuWidth - 8)), width: menuWidth,
        maxHeight: Math.min(260, upward ? above : below), top: upward ? undefined : rect.bottom + 5,
        bottom: upward ? window.innerHeight - rect.top + 5 : undefined });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [open, options.length]);
  useEffect(() => {
    if (!open) return;
    const close = event => {
      if (!trigger.current.contains(event.target) && !menu.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => {
    if (!open || !menu.current) return;
    const option = menu.current.querySelector('[data-active=true]');
    if (!option) return;
    const container = menu.current;
    if (option.offsetTop < container.scrollTop) container.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > container.scrollTop + container.clientHeight)
      container.scrollTop = option.offsetTop + option.offsetHeight - container.clientHeight;
  }, [active, open]);

  const show = () => { setActive(enabled.includes(selected) ? selected : enabled[0] ?? 0); setOpen(true); };
  const choose = index => {
    if (!options[index] || options[index].disabled) return;
    const target = { name, value: options[index].value };
    onChange?.({ target, currentTarget: target });
    setOpen(false);
    trigger.current.focus();
  };
  return <div className="responsive-select">
    <select className="responsive-select-native" name={name} value={value} required={required} disabled={disabled} tabIndex={-1} aria-hidden="true" onChange={onChange}
      onInvalid={event => { event.preventDefault(); trigger.current.focus(); show(); }}>{children}</select>
    <button {...props} ref={trigger} type="button" role="combobox" className={'responsive-select-trigger ' + className}
      disabled={disabled || !options.length} aria-required={required} aria-haspopup="listbox" aria-expanded={open}
      aria-controls={open ? id : undefined} aria-activedescendant={open ? `${id}-${active}` : undefined}
      onClick={() => open ? setOpen(false) : show()} onBlur={() => setOpen(false)}
      onKeyDown={event => {
        if (event.key === 'Escape') { if (open) { event.preventDefault(); event.stopPropagation(); } setOpen(false); return; }
        if (event.key === 'Tab') { setOpen(false); return; }
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
    {open && position && createPortal(<div ref={menu} id={id} role="listbox" aria-label={props['aria-label']}
      className="responsive-select-menu" style={position} onMouseDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
      {options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option" aria-selected={selected === index} aria-disabled={!!option.disabled}
        data-active={active === index} onPointerDown={event => event.preventDefault()}
        onMouseMove={() => { if (!option.disabled) setActive(index); }} onClick={() => choose(index)}>
        <span>{option.label}</span>{selected === index && <Check size={16}/>}</div>)}
    </div>, document.body)}
  </div>;
}
