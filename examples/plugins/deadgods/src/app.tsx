import { useEffect } from "react";
import {
  usePublicKey,
  useConnection,
  useTheme,
  useNavigation,
  View,
  Image,
  Text,
  Button,
  NavStack,
  NavScreen,
} from "react-xnft";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
  useDegodTokens,
  useEstimatedRewards,
  gemFarmClient,
  DEAD_FARM,
} from "./utils";

export function App() {
  return (
    <View
      style={{
        backgroundImage:
          "url(https://user-images.githubusercontent.com/6990215/180327248-61e7675e-490b-4bdf-8588-370aa008302a.png)",
        backgroundRepeat: "no-repeat",
        height: "100%",
        backgroundColor: "#111827",
      }}
    >
      <View
        style={{
          background:
            "linear-gradient(180deg, rgba(17, 24, 39, 0) 38.3%, rgba(17, 24, 39, 0.102162) 38.3%, #111827 81.65%)",
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          height: "460px",
        }}
      ></View>
      <View style={{ height: "100%" }}>
        <NavStack
          initialRoute={{ name: "stake" }}
          options={({ route }) => {
            switch (route.name) {
              case "stake":
                return {
                  title: "",
                };
              case "deadgods":
                return { title: "Stake Deadgods" };
              case "degods":
                return { title: "Stake Degods" };
              default:
                throw new Error("unknown route");
            }
          }}
          style={{}}
        >
          <NavScreen
            name={"stake"}
            component={(props: any) => <Stake {...props} />}
          />
          <NavScreen
            name={"deadgods"}
            component={(props: any) => <DeadGods {...props} />}
          />
        </NavStack>
      </View>
    </View>
  );
}

function Stake() {
  return (
    <View
      style={{
        height: "100%",
      }}
    >
      <View>
        <_Stake />
      </View>
    </View>
  );
}

function _Stake() {
  const tokens = useDegodTokens();
  const estimatedRewards = useEstimatedRewards();
  return (
    <View>
      <Header isDead={true} estimatedRewards={estimatedRewards} />
    </View>
  );
}

function DeadGods() {
  const nav = useNavigation();

  return (
    <View
      style={{ color: "red" }}
      onClick={() => {
        nav.push("root");
      }}
    >
      InnerTab2 Click me 2InnerTab2
    </View>
  );
}

function AppInner() {
  const isDead = false;
  const tokenAccounts = useDegodTokens()!;
  const estimatedRewards = useEstimatedRewards();

  if (tokenAccounts === null) return <View></View>;

  return (
    <View
      style={{
        marginTop: "24px",
        marginBottom: "38px",
      }}
    >
      <Header isDead={isDead} estimatedRewards={estimatedRewards} />
      <GodGrid isDead={isDead} gods={tokenAccounts.dead} isStaked={true} />
      <GodGrid
        isDead={isDead}
        gods={tokenAccounts.deadUnstaked}
        isStaked={false}
      />
    </View>
  );
}

function Header({ isDead, estimatedRewards }: any) {
  const publicKey = usePublicKey();
  const connection = useConnection();

  const claimDust = () => {
    (async () => {
      const farmClient = gemFarmClient();
      const rewardAMint = new PublicKey(
        "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"
      );
      const rewardBMint = new PublicKey(
        "So11111111111111111111111111111111111111112"
      );
      const [farmer, bumpFarmer] = await PublicKey.findProgramAddress(
        [Buffer.from("farmer"), DEAD_FARM.toBuffer(), publicKey.toBuffer()],
        farmClient.programId
      );
      const [farmAuthority, bumpAuth] = await PublicKey.findProgramAddress(
        [DEAD_FARM.toBuffer()],
        farmClient.programId
      );
      const [rewardAPot, bumpPotA] = await PublicKey.findProgramAddress(
        [
          Buffer.from("reward_pot"),
          DEAD_FARM.toBuffer(),
          rewardAMint.toBuffer(),
        ],
        farmClient.programId
      );
      const [rewardBPot, bumpPotB] = await PublicKey.findProgramAddress(
        [
          Buffer.from("reward_pot"),
          DEAD_FARM.toBuffer(),
          rewardBMint.toBuffer(),
        ],
        farmClient.programId
      );

      try {
        const tx = await farmClient.methods
          .claim(bumpAuth, bumpFarmer, bumpPotA, bumpPotB)
          .accounts({
            farm: DEAD_FARM,
            farmAuthority,
            farmer,
            identity: publicKey,
            rewardAPot,
            rewardAMint,
            rewardADestination: await anchor.utils.token.associatedAddress({
              mint: rewardAMint,
              owner: publicKey,
            }),
            rewardBPot,
            rewardBMint,
            rewardBDestination: await anchor.utils.token.associatedAddress({
              mint: rewardBMint,
              owner: publicKey,
            }),
          })
          .transaction();
        const signature = await window.anchorUi.send(tx);
        console.log("tx signature", signature);
      } catch (err) {
        console.log("err here", err);
      }
    })();
  };
  return (
    <View
      style={{
        marginTop: "255px",
      }}
    >
      <View>
        <Text
          style={{
            textAlign: "center",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: "150%",
          }}
        >
          Estimated Rewards
        </Text>
        <Text
          style={{
            fontSize: "40px",
            marginTop: "12px",
            textAlign: "center",
            fontWeight: 500,
            lineHeight: "24px",
            color: "#fff",
          }}
        >
          {estimatedRewards} DUST
        </Text>
        <Text
          style={{
            marginTop: "12px",
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
          }}
        >
          {isDead ? 15 : 5} $DUST/day
        </Text>
      </View>
      <View
        style={{
          marginTop: "20px",
          width: "268px",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Button
          onClick={claimDust}
          style={{
            flex: 1,
            background: "#FFEFEB",
            border: "1px solid #000000",
            boxShadow: "4px 3px 0px #6100FF",
            borderRadius: "8px",
            width: "192px",
            height: "40px",
            color: "#6100FF",
            fontWeight: 500,
          }}
        >
          Claim $DUST
        </Button>
      </View>
    </View>
  );
}

function GodGrid({ gods, isDead, isStaked }: any) {
  const theme = useTheme();
  const degodLabel = isDead ? "DeadGods" : "Degods";

  const clickGod = (god: any) => {
    console.log("clicked god", god);
  };

  return (
    <View
      style={{
        marginTop: "38px",
      }}
    >
      <Text
        style={{
          marginBottom: "8px",
          fontSize: "14px",
          lineHeight: "24px",
          marginLeft: "12px",
          marginRight: "12px",
        }}
      >
        {isStaked ? "Staked" : "Unstaked"} {degodLabel}
      </Text>
      <View
        style={{
          display: "flex",
          background: theme.custom.colors.nav,
        }}
      >
        {gods.map((g) => {
          return (
            <Button
              key={g.tokenMetaUriData.image}
              onClick={() => clickGod(g)}
              style={{
                padding: 0,
                width: "50%",
                height: "100%",
              }}
            >
              <Image src={g.tokenMetaUriData.image} style={{ width: "100%" }} />
            </Button>
          );
        })}
      </View>
    </View>
  );
}

export function StakeDetail({ token }: any) {
  const publicKey = usePublicKey();
  const connection = useConnection();

  const unstake = async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 1000000,
      })
    );
    console.log("plugin fetching most recent blockhash");
    const { blockhash } = await connection!.getLatestBlockhash("recent");
    console.log("plugin got recent blockhash", blockhash);
    tx.recentBlockhash = blockhash;
    const signature = await window.anchorUi.send(tx);
    console.log("test: got signed transaction here", signature);
  };

  return (
    <View>
      <Image
        src={token.tokenMetaUriData.image}
        style={{
          width: "343px",
          height: "343px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "16px",
          display: "block",
          borderRadius: "8px",
        }}
      />
      <View
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          width: "343px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Button
          onClick={() => unstake()}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "12px",
          }}
        >
          <Text>Unstake</Text>
        </Button>
      </View>
    </View>
  );
}