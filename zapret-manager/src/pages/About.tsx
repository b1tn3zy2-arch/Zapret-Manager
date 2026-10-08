import { useState, type ReactNode } from "react";
import { CircleAlert, Info, Search, Shield, Trash2 } from "lucide-react";

import BrandIcon, { type BrandIconName } from "@/components/shared/BrandIcon";
import FlagIcon, { type CountryCode } from "@/components/shared/FlagIcon";
import { GlassPanel } from "@/components/shared/GlassPanel";
import MocksPanel from "@/components/shared/MocksPanel";
import {
  Badge,
  Button,
  Card,
  Heading,
  Input,
  Modal,
  Skeleton,
  Spinner,
  Text,
  Toggle,
  Tooltip,
  type BadgeVariant,
  type ButtonSize,
  type CardVariant,
  type ControlVariant,
  type ModalSize,
  type TooltipSide,
} from "@/components/ui";
import { APP_VERSION } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "ghost",
  "danger",
] as const satisfies readonly ControlVariant[];

const BUTTON_SIZES = [
  "sm",
  "md",
  "lg",
  "icon",
] as const satisfies readonly ButtonSize[];

const CARD_VARIANTS = [
  "default",
  "interactive",
  "outlined",
] as const satisfies readonly CardVariant[];

const BADGE_VARIANTS = [
  "success",
  "warning",
  "error",
  "info",
  "neutral",
  "accent",
] as const satisfies readonly BadgeVariant[];

const BRAND_NAMES = [
  "discord",
  "youtube",
  "steam",
  "github",
  "battlEye",
] as const satisfies readonly BrandIconName[];

const FLAG_CODES = [
  "RU",
  "US",
  "WS",
  "KZ",
  "BY",
  "DE",
  "NL",
  "FI",
  "GB",
  "UA",
  "FR",
  "JP",
] as const satisfies readonly CountryCode[];

const TOOLTIP_SIDES = [
  "top",
  "bottom",
  "left",
  "right",
] as const satisfies readonly TooltipSide[];

const MODAL_SIZES = [
  "sm",
  "md",
  "lg",
  "xl",
] as const satisfies readonly ModalSize[];

interface SectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Heading level={3}>{title}</Heading>
        <Text variant="caption" size="md">
          {description}
        </Text>
      </div>
      {children}
    </section>
  );
}

function ShowcaseLabel({ children }: { children: string }) {
  return <span className="text-text-tertiary text-xs">{children}</span>;
}

export default function About() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    sm: true,
    md: false,
    lg: true,
    disabled: true,
  });
  const [openModal, setOpenModal] = useState<ModalSize | null>(null);
  const [cardClicks, setCardClicks] = useState(0);

  const handleToggle = (key: string) => (checked: boolean) => {
    setToggles((previous) => ({ ...previous, [key]: checked }));
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Shield
            aria-hidden="true"
            className="text-accent-primary size-8"
            strokeWidth={2}
          />
          <Heading level={1}>Дизайн-система</Heading>
        </div>
        <Text variant="body" size="lg" className="text-text-secondary">
          Витрина всех компонентов интерфейса. Версия {APP_VERSION}.
        </Text>
        <Text variant="caption" size="sm">
          Страница временная, этап 4 заменит её на реальную «О приложении».
        </Text>
      </header>

      <Section
        title="Button"
        description="4 варианта × 4 размера, состояния loading и disabled"
      >
        <GlassPanel className="flex flex-col gap-4">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex items-center gap-3">
              <ShowcaseLabel>{`variant=${variant}`}</ShowcaseLabel>
              <div className="flex flex-wrap items-center gap-2">
                {BUTTON_SIZES.map((size) => (
                  <Button
                    key={size}
                    variant={variant}
                    size={size}
                    aria-label={
                      size === "icon" ? `Button ${variant} icon` : undefined
                    }
                    icon={
                      size === "icon" ? <Shield strokeWidth={2} /> : undefined
                    }
                  >
                    {size === "icon" ? null : `Button ${size}`}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
            <Button icon={<Shield strokeWidth={2} />}>Иконка слева</Button>
            <Button iconRight={<Shield strokeWidth={2} />}>
              Иконка справа
            </Button>
            <Button loading>Загрузка</Button>
            <Button disabled>Недоступно</Button>
            <Button variant="danger" icon={<Trash2 strokeWidth={2} />}>
              Удалить
            </Button>
          </div>
        </GlassPanel>
      </Section>

      <Section
        title="Card"
        description="3 варианта, interactive реагирует на клик и клавиатуру"
      >
        <div className="grid grid-cols-3 gap-4">
          {CARD_VARIANTS.map((variant) => (
            <Card
              key={variant}
              variant={variant}
              onClick={
                variant === "interactive"
                  ? () => {
                      setCardClicks((count) => count + 1);
                    }
                  : undefined
              }
              className="flex flex-col gap-2"
            >
              <Text variant="label" size="md">
                Card — {variant}
              </Text>
              <Text variant="caption" size="sm">
                {variant === "interactive"
                  ? `Кликов: ${cardClicks}. Enter и Space тоже работают.`
                  : "Статичная карточка."}
              </Text>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Input"
        description="default и filled, иконки, ошибка, подсказка, disabled"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Название" placeholder="Например, general" />
          <Input
            label="С иконкой"
            variant="filled"
            icon={<Search strokeWidth={2} />}
            placeholder="Поиск стратегии"
          />
          <Input
            label="С ошибкой"
            error
            errorMessage="Имя уже занято"
            defaultValue="general"
          />
          <Input
            label="С подсказкой"
            hint="До 64 символов"
            defaultValue="fast"
            variant="filled"
          />
          <Input label="Размер sm" size="sm" variant="filled" />
          <Input label="Размер lg" size="lg" disabled defaultValue="off" />
        </div>
      </Section>

      <Section title="Toggle" description="3 размера, disabled, role=switch">
        <GlassPanel className="flex flex-col gap-4">
          <Toggle
            checked={toggles.sm ?? false}
            onChange={handleToggle("sm")}
            size="sm"
            label="Размер sm"
          />
          <Toggle
            checked={toggles.md ?? false}
            onChange={handleToggle("md")}
            size="md"
            label="Размер md"
            description="Thumb переезжает за 200 мс"
          />
          <Toggle
            checked={toggles.lg ?? false}
            onChange={handleToggle("lg")}
            size="lg"
            label="Размер lg"
          />
          <Toggle
            checked={toggles.disabled ?? true}
            onChange={handleToggle("disabled")}
            disabled
            label="Недоступно"
          />
        </GlassPanel>
      </Section>

      <Section title="Badge" description="6 вариантов, точка и пульсация">
        <div className="flex flex-wrap items-center gap-3">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant} dot>
              {variant}
            </Badge>
          ))}
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={`${variant}-sm`} variant={variant} size="sm" pulse>
              {variant}
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        title="Skeleton и Spinner"
        description="Заглушки при загрузке и индикатор"
      >
        <GlassPanel className="flex items-center gap-8">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" width={40} height={40} />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </div>
            </div>
            <Skeleton variant="rect" height={72} />
          </div>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="sm" />
              <ShowcaseLabel>sm</ShowcaseLabel>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="md" />
              <ShowcaseLabel>md</ShowcaseLabel>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <ShowcaseLabel>lg</ShowcaseLabel>
            </div>
          </div>
        </GlassPanel>
      </Section>

      <Section
        title="Modal"
        description="Portal в body, focus trap, Escape, клик по фону"
      >
        <div className="flex flex-wrap items-center gap-3">
          {MODAL_SIZES.map((size) => (
            <Button
              key={size}
              variant="secondary"
              onClick={() => {
                setOpenModal(size);
              }}
            >
              Открыть {size}
            </Button>
          ))}
        </div>

        <Modal
          open={openModal !== null}
          onClose={() => {
            setOpenModal(null);
          }}
          title={openModal === null ? "Modal" : `Modal — ${openModal}`}
          description="Portal в body, фокус заперт, Escape закрывает"
          size={openModal ?? "md"}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setOpenModal(null);
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  setOpenModal(null);
                }}
              >
                Подтвердить
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <Text variant="body">
              Панель смонтирована через createPortal в document.body и не
              наследует overflow прокручиваемого контейнера.
            </Text>
            <div className="flex flex-col gap-2">
              <Skeleton width="80%" />
              <Skeleton width="60%" />
              <Skeleton width="70%" />
            </div>
          </div>
        </Modal>
      </Section>

      <Section
        title="Tooltip"
        description="4 стороны, задержка 300 мс, позиция через getBoundingClientRect"
      >
        <div className="flex items-center gap-6">
          {TOOLTIP_SIDES.map((side) => (
            <Tooltip key={side} content={`Tooltip — ${side}`} side={side}>
              <Button variant="secondary" size="sm">
                {side}
              </Button>
            </Tooltip>
          ))}
        </div>
      </Section>

      <Section
        title="Heading и Text"
        description="6 уровней заголовков и 4 варианта текста"
      >
        <GlassPanel className="flex flex-col gap-3">
          <Heading level={1}>Heading 1</Heading>
          <Heading level={2}>Heading 2</Heading>
          <Heading level={3}>Heading 3</Heading>
          <Heading level={4}>Heading 4</Heading>
          <Heading level={5}>Heading 5</Heading>
          <Heading level={6}>Heading 6</Heading>
          <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-3">
            <Text variant="body" size="lg">
              Text — body lg
            </Text>
            <Text variant="body" size="sm">
              Text — body sm
            </Text>
            <Text variant="caption">Text — caption</Text>
            <Text variant="label">Text — label</Text>
            <Text variant="mono">Text — mono winws.exe</Text>
          </div>
        </GlassPanel>
      </Section>

      <Section
        title="BrandIcon и FlagIcon"
        description="Фирменные иконки и флаги, локальные ассеты"
      >
        <GlassPanel className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {BRAND_NAMES.map((name) => (
              <Tooltip key={name} content={name} side="top">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    "text-text-primary border border-white/10 bg-white/5"
                  )}
                >
                  <BrandIcon name={name} className="size-5" />
                </span>
              </Tooltip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
            {FLAG_CODES.map((code) => (
              <Tooltip key={code} content={code} side="bottom">
                <span className="flex items-center gap-2 rounded-md border border-white/10 px-2 py-1">
                  <FlagIcon code={code} />
                  <Text variant="mono" size="sm">
                    {code}
                  </Text>
                </span>
              </Tooltip>
            ))}
          </div>
        </GlassPanel>
      </Section>

      <section className="text-text-tertiary flex items-center gap-2">
        <Info aria-hidden="true" className="size-4" strokeWidth={2} />
        <Text variant="caption">Этап 4 — типы и сторы готовы</Text>
        <CircleAlert aria-hidden="true" className="size-4" strokeWidth={2} />
      </section>

      {import.meta.env.DEV ? <MocksPanel /> : null}
    </div>
  );
}
