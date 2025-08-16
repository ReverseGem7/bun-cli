import { initCLI } from "clivex";
import { z } from "zod/v4";

const { flag, command, commands, runCLI } = initCLI.create();

const Language = z.enum(["en", "es", "fr", "de", "it"]);
const TimeOfDay = z.enum(["morning", "afternoon", "evening", "night"]);

const greetings = {
	en: {
		formal: "Good day",
		informal: "Hello",
		morning: "Good morning",
		afternoon: "Good afternoon",
		evening: "Good evening",
		night: "Good night",
	},
	es: {
		formal: "Buenos días",
		informal: "Hola",
		morning: "Buenos días",
		afternoon: "Buenas tardes",
		evening: "Buenas tardes",
		night: "Buenas noches",
	},
	fr: {
		formal: "Bonjour",
		informal: "Salut",
		morning: "Bonjour",
		afternoon: "Bon après-midi",
		evening: "Bonsoir",
		night: "Bonne nuit",
	},
	de: {
		formal: "Guten Tag",
		informal: "Hallo",
		morning: "Guten Morgen",
		afternoon: "Guten Tag",
		evening: "Guten Abend",
		night: "Gute Nacht",
	},
	it: {
		formal: "Buongiorno",
		informal: "Ciao",
		morning: "Buongiorno",
		afternoon: "Buon pomeriggio",
		evening: "Buonasera",
		night: "Buonanotte",
	},
};

const cli = commands({
	greet: command
		.flags({
			name: flag
				.input(z.string().default("Stranger"))
				.options({ short: "n", description: "Name of the person to greet" }),
			language: flag
				.input(Language.default("en"))
				.options({ short: "l", description: "Language code" }),
			formal: flag
				.input(z.boolean().optional())
				.options({ short: "f", description: "Use formal greeting" }),
			time: flag
				.input(TimeOfDay.optional())
				.options({ short: "t", description: "Time of day" }),
		})
		.run(({ flags }) => {
			const { formal, language, name, time } = flags;

			let greeting: string;
			if (formal) {
				greeting = greetings[language].formal;
			} else if (time) {
				greeting = greetings[language][time];
			} else {
				greeting = greetings[language].informal;
			}

			console.log(`${greeting}, ${name}!`);
		}),
	goodbye: command
		.flags({
			name: flag.input(z.string().default("Stranger")).options({
				short: "n",
				description: "Name of the person to say goodbye to",
			}),
			language: flag
				.input(Language.default("en"))
				.options({ short: "l", description: "Language code" }),
		})
		.run(({ flags }) => {
			const { language, name } = flags;

			const farewells: Record<string, string> = {
				en: "Goodbye",
				es: "Adiós",
				fr: "Au revoir",
				de: "Auf Wiedersehen",
				it: "Arrivederci",
			};

			console.log(`${farewells[language]}, ${name}!`);
		}),
});

runCLI(cli);
