/** Valid 10-minute current reading CSV */
export const VALID_CURRENT_CSV = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0
11.01.2026 13:20;GOE;12.3;8;0.5;5.0;180;1013.25
11.01.2026 13:10;GOE;12.1;9;0.3;4.8;175;1013.30`;

/** Valid hourly reading CSV */
export const VALID_HOURLY_CSV = `reference_timestamp;station_abbr;tre200h0;sre000h0;rre150h0;fkl010h0;dkl010h0;pp0qnhh0
11.01.2026 12:00;GOE;11.5;45;1.2;3.5;200;1014.0
11.01.2026 11:00;GOE;10.8;50;0.8;4.0;210;1014.5
11.01.2026 10:00;GOE;9.2;55;0.0;3.2;190;1015.0`;

/** CSV missing required column */
export const MISSING_COLUMN_CSV = `station_abbr;tre200s0;sre000z0
GOE;12.3;8`;

/** CSV with wrong station */
export const WRONG_STATION_CSV = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0
11.01.2026 13:20;ABC;12.3;8;0.5;5.0;180;1013.25`;

/** CSV with empty numeric values (valid - should become null) */
export const EMPTY_VALUES_CSV = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0
11.01.2026 13:20;GOE;12.3;;;;;`;

/** CSV with invalid numeric value */
export const INVALID_NUMERIC_CSV = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0
11.01.2026 13:20;GOE;not-a-number;8;0.5;5.0;180;1013.25`;

/** Empty CSV (only header) */
export const EMPTY_DATA_CSV = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0`;

/** CSV with readings from different days */
export const MULTI_DAY_CSV = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0
11.01.2026 13:20;GOE;12.3;8;0.5;5.0;180;1013.25
10.01.2026 13:20;GOE;11.0;6;0.2;4.5;170;1012.0
09.01.2026 13:20;GOE;10.5;4;0.0;6.0;200;1010.5`;
