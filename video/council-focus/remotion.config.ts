import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
// Use installed Chrome on this workstation; other machines use Remotion's browser.
if (process.env.REMOTION_BROWSER_EXECUTABLE) Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
