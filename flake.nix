{
  # main
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    deno2nix.url = "github:SnO2WMaN/deno2nix";
    devshell.url = "github:numtide/devshell";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachSystem ["x86_64-linux"] (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = with inputs; [
            devshell.overlay
            deno2nix.overlays.default
          ];
        };
      in {
        devShells.default = pkgs.devshell.mkShell {
          packages = with pkgs; [
            alejandra
            treefmt
            deno
          ];
          devshell.startup.deno_lock.text = "deno task lock";
        };
      }
    );
}
