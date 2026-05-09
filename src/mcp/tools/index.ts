import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerAnalyzeProgressionTool } from './analyze-progression/index.js';
import { registerAnalyzeVoiceLeadingTool } from './analyze-voice-leading/index.js';
import { registerDetectKeyTool } from './detect-key/index.js';
import { registerGetChordTool } from './get-chord/index.js';
import { registerGetDiatonicChordsTool } from './get-diatonic-chords/index.js';
import { registerGetIntervalTool } from './get-interval/index.js';
import { registerGetKeyTool } from './get-key/index.js';
import { registerGetNoteInfoTool } from './get-note-info/index.js';
import { registerGetScaleTool } from './get-scale/index.js';
import { registerJokeTool } from './joke/index.js';
import { registerSuggestSubstitutionsTool } from './suggest-substitutions/index.js';
import { registerTransposeProgressionTool } from './transpose-progression/index.js';
import { registerTransposeTool } from './transpose/index.js';

export function registerAllTools(server: McpServer): void {
  registerJokeTool(server);
  registerGetNoteInfoTool(server);
  registerGetIntervalTool(server);
  registerGetScaleTool(server);
  registerGetChordTool(server);
  registerTransposeTool(server);
  registerGetKeyTool(server);
  registerAnalyzeProgressionTool(server);
  registerDetectKeyTool(server);
  registerTransposeProgressionTool(server);
  registerGetDiatonicChordsTool(server);
  registerSuggestSubstitutionsTool(server);
  registerAnalyzeVoiceLeadingTool(server);
}
