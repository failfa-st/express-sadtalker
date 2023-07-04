function condaPython(condaEnv, pythonScriptPath) {
    switch (process.platform) {
        case 'win32':
            // Detect if using cmd.exe or PowerShell on Windows
            if (process.env.ComSpec && process.env.ComSpec.endsWith('cmd.exe')) {
                // For cmd.exe on Windows
                return `activate ${condaEnv} && python ${pythonScriptPath}`;
            } else {
                // For PowerShell on Windows
                return `conda activate ${condaEnv}; python ${pythonScriptPath}`;
            }
        default:
            // For Unix-based platforms (Linux, macOS)
            // Use the CONDA_EXE environment variable to get the conda path
            const condaPath = process.env.CONDA_EXE || 'conda';
            return `eval "$(${condaPath} shell.posix activate ${condaEnv})" && python ${pythonScriptPath}`;
 
    }
}

export { condaPython };
