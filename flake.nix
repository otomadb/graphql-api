{
  # main
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-utils.follows = "flake-utils";
    };
    prisma-engines.url = "github:prisma/prisma-engines/4.13.0";
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
            devshell.overlays.default
          ];
        };
        prisma-engines = inputs.prisma-engines.packages.${system}.prisma-engines;
      in {
        devShells.default = pkgs.devshell.mkShell {
          packages = with pkgs; [
            act
            actionlint
            alejandra
            hadolint
            nodejs-19_x
            openssl
            pgcli
            postgresql_15
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
