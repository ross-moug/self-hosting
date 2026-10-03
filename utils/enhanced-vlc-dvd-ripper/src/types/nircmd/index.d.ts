declare module "nircmd" {
  function nircmd(command: string | string[], opts?: import("child_process").ExecFileOptions): Promise<void>;

  namespace nircmd {
    function spawn(
      command: string | string[],
      opts?: import("child_process").ExecFileOptions,
    ): import("child_process").ChildProcess;
  }

  export default nircmd;
}
