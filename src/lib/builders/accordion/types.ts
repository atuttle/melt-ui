import type { BuilderReturn } from '$lib/internal/types';
import type { createAccordion } from './create';

export type AccordionType = 'single' | 'multiple';

export type CreateAccordionProps<T extends AccordionType = 'single'> = {
	value?: T extends 'single' ? string : string[];
	type?: T;
	disabled?: boolean;
};

export type AccordionItemProps =
	| {
			value: string;
			disabled?: boolean;
	  }
	| string;

export type AccordionHeadingProps =
	| {
			level: 1 | 2 | 3 | 4 | 5 | 6;
	  }
	| number;

export type Accordion = BuilderReturn<typeof createAccordion>;
export type AccordionElements = Accordion['elements'];
export type AccordionOptions = Accordion['options'];
export type AccordionStates = Accordion['states'];
export type AccordionHelpers = Accordion['helpers'];
