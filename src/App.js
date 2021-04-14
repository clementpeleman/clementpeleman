import Header from "./components/Header";
import State from "./components/State";
import { Section } from "./components/Section";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect, useState } from "react";
import { Html, useGLTF, useProgress } from "@react-three/drei";
import { useInView } from "react-intersection-observer";
import { a, useTransition } from "@react-spring/web";

const Model = ({ url, PosY, RotX, RotY }) => {
  const gltf = useGLTF(url, true);
  const model = gltf.scene;
  model.rotation.x = RotX;
  model.rotation.y = RotY;
  model.position.y = PosY;
  console.log(RotX);
  return <primitive object={gltf.scene} dispose={null} />;
};

const Lights = () => {
  return (
    <>
      {/* Ambient Light illuminates lights for all objects */}
      <ambientLight intensity={0.4} />
      {/* Diretion light */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 5, 0]} intensity={0.4} />
      <directionalLight position={[0, 5, 100]} intensity={0.7} />
      <directionalLight
        castShadow
        position={[0, 10, 0]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* Spotlight Large overhead light */}
      <spotLight intensity={1} position={[1000, 0, 0]} castShadow />
    </>
  );
};

const HTMLContent = ({
  domContent,
  children,
  bgColor,
  modelPath,
  position,
  PositionX,
  PositionY,
  RotationX,
  RotationY,
}) => {
  const ref = useRef();
  useFrame(() => (ref.current.rotation.y += 0.009));
  const [refItem, inView] = useInView({
    threshold: 0,
  });
  useEffect(() => {
    inView && (document.body.style.background = bgColor);
  }, [inView]);
  return (
    <Section factor={1.5} offset={1}>
      <group position={[0, position, 0]}>
        <mesh ref={ref} position={[PositionX, 3.45, 0]}>
          <Model
            url={modelPath}
            PosY={PositionY}
            RotX={RotationX}
            RotY={RotationY}
          />
          <meshStandardMaterial color="blue" />
        </mesh>
        <Html fullscreen portal={domContent}>
          <div ref={refItem} className="container">
            <div className="title">{children}</div>
          </div>
        </Html>
      </group>
    </Section>
  );
};

function Loader() {
  const { active, progress } = useProgress();
  const transition = useTransition(active, {
    from: { opacity: 1, progress: 0 },
    leave: { opacity: 0 },
    update: { progress },
  });
  return transition(
    ({ progress, opacity }, active) =>
      active && (
        <a.div className="loading" style={{ opacity }}>
          <div className="loading-bar-container">
            <a.div className="loading-bar" style={{ width: progress }}></a.div>
          </div>
        </a.div>
      )
  );
}

export default function App() {
  const [events] = useState();
  const domContent = useRef();
  const scrollArea = useRef();
  const onScroll = (e) => (State.top.current = e.target.scrollTop);
  useEffect(() => void onScroll({ target: scrollArea.current }), []);
  return (
    <>
      <Header />
      <Canvas
        concurrent
        colorManagement
        camera={{ position: [0, 0, 1], fov: 70 }}
        gl={{ antialias: true }}
      >
        <Lights />
        <Suspense fallback={null}>
          <HTMLContent
            domContent={domContent}
            bgColor="#ffaaa7"
            modelPath="/model/shoe_dispenser.gltf"
            position={2.1}
            PositionX="0.7"
            PositionY="-4"
            RotationX={Math.PI / 2}
            RotationY={Math.PI}
          >
            <h1>shoemate. </h1>
            <h2>the first reusable shoe cover dispenser </h2>
          </HTMLContent>
          <HTMLContent
            domContent={domContent}
            bgColor="#98ddca"
            modelPath="/model/fik.gltf"
            position={0}
            PositionX="0.6"
            PositionY="-3.7"
            RotationX={Math.PI / 3}
            RotationY={Math.PI}
          >
            <h1>fik.</h1>
            <h2> new firepit experience </h2>
          </HTMLContent>
        </Suspense>
      </Canvas>
      <Loader />
      <div
        className="scrollArea"
        ref={scrollArea}
        onScroll={onScroll}
        style={{ overflowX: "hidden" }}
        {...events}
      >
        <div style={{ position: "sticky", top: 0 }} ref={domContent} />
        <div style={{ height: `${State.pages * 100}vh` }} />
      </div>
    </>
  );
}
