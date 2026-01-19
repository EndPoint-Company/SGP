"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Consulta, ConsultaStatus } from "../../../features/appointments/types";
import { formatAppointmentDate as formatEventTime } from "../../../utils/dataHelpers";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type EventConsulta = Consulta & { 
  id: string;
  alunoId: string;
  psicologoId: string;
  horario: string;
  status: ConsultaStatus;
  participantName?: string;
};

// 1. ATUALIZAÇÃO: Adicionadas novas props para suporte ao Hover
interface ContinuousCalendarProps {
  role: "aluno" | "psicologo";
  currentUserId: string;
  events?: EventConsulta[];
  availability?: Record<string, string[]>;
  onDayClick: (date: Date) => void;
  onAddClick?: (date: Date) => void;
  onPendingDaySelect?: (date: Date) => void;
  isSelectionMode?: boolean;
  selectedPendingDays?: Date[];
  viewingDay?: Date | null;
  className?: string;
  
  // Novas props
  previewDays?: Date[];
  onDayHover?: (date: Date) => void;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({
  role,
  events = [],
  availability = {},
  onDayClick,
  onAddClick = () => {},
  onPendingDaySelect = () => {},
  isSelectionMode = false,
  selectedPendingDays = [],
  viewingDay = null,
  className = "",
  // Destructuring das novas props com valor padrão
  previewDays = [],
  onDayHover
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [scrollToTarget, setScrollToTarget] = useState<{ date: Date; instant: boolean } | null>(null);

  const monthOptions = monthNames.map((month, index) => ({
    name: month,
    value: `${index}`,
  }));

  const formatDateKey = (currentDate: Date) => {
    return `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  }

  const scrollToDay = (
    dateToScroll: Date,
    center = true,
    instant = false
  ) => {
    const key = formatDateKey(dateToScroll);
    const targetElement = dayRefs.current.get(key);
    const headerElement = document.querySelector("#calendar-header");
    const container = document.querySelector(".calendar-container");

    if (targetElement && container && headerElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const headerHeight = (headerElement as HTMLElement).offsetHeight;
        let offset;
        if (center) {
          const is2xl = window.matchMedia("(min-width: 1536px)").matches;
          const offsetFactor = is2xl ? 3 : 2.5;
          offset =
            elementRect.top -
            containerRect.top -
            containerRect.height / offsetFactor +
            elementRect.height / 2;
        } else {
          offset = elementRect.top - containerRect.top - headerHeight - 16;
        }
        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: instant ? "auto" : "smooth",
        });
    }
  };
  
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
    setScrollToTarget({ date: new Date(year, monthIndex, 1), instant: true });
  };

  const handleTodayClick = () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (year !== todayDate.getFullYear()) {
      setYear(todayDate.getFullYear());
    }
    setSelectedMonth(todayDate.getMonth());
    setScrollToTarget({ date: todayDate, instant: false });
  };
  
  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: EventConsulta[] } = {};
    events.forEach((event) => {
      const key = formatDateKey(new Date(event.horario));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return grouped;
  }, [events]);

  const calendarContent = useMemo(() => {
    const calendarDays = [];
    const startDate = new Date(year, 0, 1);
    const startDayOfWeek = startDate.getDay();
    
    for (let i = 0; i < startDayOfWeek; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() - (startDayOfWeek - i));
        calendarDays.push({ date: day, isCurrentMonth: false });
    }

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
          date: new Date(year, month, day),
          isCurrentMonth: true,
        });
      }
    }

    const lastWeekDayCount = calendarDays.length % 7;
    if (lastWeekDayCount > 0) {
      const extraDaysNeeded = 7 - lastWeekDayCount;
      for (let day = 1; day <= extraDaysNeeded; day++) {
        calendarDays.push({
          date: new Date(year + 1, 0, day),
          isCurrentMonth: false,
        });
      }
    }

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    return weeks;
  }, [year]);

 useEffect(() => {
    if (!scrollToTarget) return;
    scrollToDay(scrollToTarget.date, true, scrollToTarget.instant);
    setScrollToTarget(null);
  }, [scrollToTarget]); 

  useEffect(() => {
    scrollToDay(new Date(), true, true);

    const calendarContainer = document.querySelector(".calendar-container");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(entry.target.getAttribute("data-month")!, 10);
            if (!isNaN(month) && month >= 0 && month < 12)
              setSelectedMonth(month);
          }
        });
      },
      { root: calendarContainer, rootMargin: "-75% 0px -25% 0px", threshold: 0 }
    );

    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute("data-day") === "15") observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`no-scrollbar calendar-container h-full overflow-y-auto bg-white pb-10 text-slate-800 shadow-interface rounded-tl-2xl ${className}`}
    >
      <div
        id="calendar-header"
        className="sticky -top-px z-50 w-full bg-white px-5 pt-7 sm:px-8 sm:pt-8"
      >
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select
              name="month"
              value={`${selectedMonth}`}
              options={monthOptions}
              onChange={handleMonthChange}
            />
            <button
              onClick={handleTodayClick}
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 lg:px-5 lg:py-2.5"
            >
              Hoje
            </button>
          </div>
          <div className="flex w-fit items-center justify-between">
            <button onClick={handlePrevYear} className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2">
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">{year}</h1>
            <button onClick={handleNextYear} className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2">
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500">
          {daysOfWeek.map((day) => (
            <div key={day} className="w-full border-b border-slate-200 py-2 text-center font-semibold">{day}</div>
          ))}
        </div>
      </div>
      <div className="w-full px-5 pt-4 sm:px-8 sm:pt-6">
        {calendarContent.map((week, weekIndex) => (
          <div className="flex w-full" key={weekIndex}>
            {week.map(({ date: currentDate, isCurrentMonth }) => {
              const day = currentDate.getDate();
              const month = currentDate.getMonth();
              const dateKey = formatDateKey(currentDate);

              const isPast = currentDate < today;
              const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
              const hasEvents = (eventsByDate[dateKey] || []).length > 0;
              const isAvailable = availability[dateKey] && availability[dateKey].length > 0;
              
              // Verificação de Estado
              const isPending = role === "psicologo" && selectedPendingDays.some((d) => d.getTime() === currentDate.getTime());
              const isViewing = viewingDay ? viewingDay.getTime() === currentDate.getTime() : false;
              
              // 2. ATUALIZAÇÃO: Verifica se é dia de Preview
              const isPreview = role === "psicologo" && previewDays.some((d) => d.getTime() === currentDate.getTime());

              // 3. ATUALIZAÇÃO: Highlight inclui preview
              const isHighlighted = isPending || isViewing || isPreview;

              const isTodayDate = currentDate.getTime() === today.getTime();
              const isNewMonth = day === 1 && isCurrentMonth;

              let isClickable = false;
              let dayBgColor = "bg-slate-100";
              let textColorClass = "text-slate-800";
              
              // 4. ATUALIZAÇÃO: Estilo de cor inclui Preview
              if (isPending || isPreview) { dayBgColor = "bg-blue-50 z-40"; }
              else if (!isCurrentMonth || isPast || isWeekend) { dayBgColor = "bg-slate-100"; textColorClass = "text-slate-400"; }
              else if (isAvailable) { dayBgColor = "bg-white"; }
              else { dayBgColor = "bg-slate-50"; }

              if (role === "aluno") { isClickable = (isAvailable && !isPast) || hasEvents; }
              else {
                const isPermanentlyDisabled = (isPast || isWeekend) && !hasEvents;
                isClickable = (!isSelectionMode && (isAvailable || hasEvents)) || (isSelectionMode && !isPast && !isWeekend && !isAvailable);
                if (isPermanentlyDisabled) dayBgColor += " pointer-events-none";
              }

              return (
                <div
                  key={dateKey}
                  ref={(el) => { dayRefs.current.set(dateKey, el); }}
                  data-month={currentDate.getMonth()}
                  data-day={currentDate.getDate()}
                  // 5. ATUALIZAÇÃO: Evento de Hover
                  onMouseEnter={() => onDayHover && onDayHover(currentDate)}
                  onClick={() => {
                    if (isClickable) {
                      if (role === "psicologo" && isSelectionMode) { onPendingDaySelect(currentDate); }
                      else { onDayClick(currentDate); }
                    }
                  }}
                  className={`relative group aspect-square -m-px w-full grow font-medium transition-all border-2 ${isHighlighted ? "border-blue-500 z-40" : "border-slate-200"} ${isClickable ? "cursor-pointer" : ""} ${ role === "psicologo" && isSelectionMode && isClickable ? "hover:border-blue-400 hover:bg-blue-50 hover:z-40" : "" } ${dayBgColor}`}
                >
                  <span className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${isTodayDate ? "bg-blue-500 font-semibold text-white" : ""} ${textColorClass}`}>
                    {day}
                  </span>
                  {isNewMonth && (
                    <span className="absolute bottom-0.5 left-0 w-full truncate px-1.5 text-sm font-semibold text-slate-300 sm:bottom-0 sm:text-lg lg:bottom-2.5 lg:left-3.5 lg:-mb-1 lg:w-fit lg:px-0 lg:text-xl 2xl:mb-[-4px] 2xl:text-2xl">
                      {monthNames[month]}
                    </span>
                  )}
                  <div className="absolute inset-x-0 top-7 bottom-0 overflow-hidden px-1 pt-1 sm:top-8 lg:top-12">
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const dayEvents = eventsByDate[dateKey] || [];
                        if (dayEvents.length === 0) return null;
                        const displayLimit = 2;
                        const eventsToDisplay = dayEvents.slice(0, displayLimit);
                        const remainingCount = dayEvents.length - eventsToDisplay.length;

                        return (
                          <>
                            {eventsToDisplay.map((event) => {
                              let pillColorClasses = "bg-gray-100 text-gray-800";
                              switch (event.status) {
                                case "confirmada": pillColorClasses = "bg-blue-100 text-blue-800"; break;
                                case "aguardando_aprovacao": pillColorClasses = "bg-yellow-100 text-yellow-800"; break;
                                case "concluida": pillColorClasses = "bg-slate-200 text-slate-500"; break;
                              }

                              return (
                                <div key={event.id} className={`flex items-center rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${pillColorClasses}`}>
                                  <span className="font-semibold">{formatEventTime(event.horario).time}</span>
                                  <span className="ml-1 truncate">{event.participantName || "..."}</span>
                                </div>
                              );
                            })}
                            {remainingCount > 0 && (
                              <div className="text-xs font-medium text-blue-800 px-1.5 py-0.5 ">
                                + {remainingCount} {remainingCount > 1 ? "outros" : "outro"}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {role === "aluno" && isClickable && !isPast && (
                    <button onClick={(e) => { e.stopPropagation(); onAddClick(currentDate); }} type="button" className="absolute right-2 top-2 rounded-full opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100">
                      <svg className="size-8 scale-90 text-blue-500 transition-transform hover:scale-100" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export interface SelectProps {
  name: string;
  value: string;
  label?: string;
  options: { name: string; value: string }[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const Select = ({
  name,
  value,
  label,
  options = [],
  onChange,
  className,
}: SelectProps) => (
  <div className={`relative ${className}`}>
    {label && (
      <label htmlFor={name} className="mb-2 block font-medium text-slate-800">
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`
        w-full cursor-pointer rounded-lg border border-gray-300 bg-white 
        py-2 pl-3 pr-10 text-sm font-medium text-gray-900 
        hover:bg-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
        sm:rounded-xl sm:py-2.5 sm:pl-4 sm:pr-12 
        appearance-none 
      `}
      required
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>

    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
      <svg
        className="size-5 text-slate-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  </div>
);