{
  # main
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-utils.follows = "flake-utils";
    };
    flake-utils.url = "github:numtide/flake-utils";
    prisma-engines = {
      url = "github:prisma/prisma-engines/4.9.0";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-utils.follows = "flake-utils";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = with inputs; [
            devshell.overlay
          ];
        };
        prisma-engines = inputs.prisma-engines.packages.${system}.prisma-engines;
      in {
        devShells.default = pkgs.devshell.mkShell {
          packages = with pkgs; [
            alejandra
            treefmt
            nodejs
            dprint
            act
            actionlint
            hadolint
          ];
          env = [
            {
              name = "PATH";
              prefix = "$PRJ_ROOT/node_modules/.bin";
            }
            {
              name = "PRISMA_MIGRATION_ENGINE_BINARY";
              value = "${prisma-engines}/bin/migration-engine";
            }
            {
              name = "PRISMA_QUERY_ENGINE_BINARY";
              value = "${prisma-engines}/bin/query-engine";
            }
            {
              name = "PRISMA_QUERY_ENGINE_LIBRARY";
              value = "${prisma-engines}/lib/libquery_engine.node";
            }
            {
              name = "PRISMA_INTROSPECTION_ENGINE_BINARY";
              value = "${prisma-engines}/bin/introspection-engine";
            }
            {
              name = "PRISMA_FMT_BINARY";
              value = "${prisma-engines}/bin/prisma-fmt";
            }
          ];
        };
      }
    );
}
