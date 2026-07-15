'use client';

/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, useEffect, memo, ReactNode, Component, ErrorInfo, Suspense } from 'react';
import { Canvas, createPortal, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

type Mode = 'lens' | 'bar' | 'cube';

interface NavItem {
  label: string;
  link: string;
}

type ModeProps = Record<string, unknown>;

interface FluidGlassProps {
  mode?: Mode;
  lensProps?: ModeProps;
  barProps?: ModeProps;
  cubeProps?: ModeProps;
  scale?: number;
  ior?: number;
  thickness?: number;
  thinkness?: number; // Alias for thickness
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  chormaticAberration?: number; // Alias for chromaticAberration
  anisotropy?: number;
  isNavbarBg?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("WebGL GLTF Model load failed. Falling back to built-in geometry. Error:", error);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function FallbackMesh({ mode, modeProps = {}, children }: { mode: Mode; modeProps?: ModeProps; children?: ReactNode }) {
  const ref = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const buffer = useFBO();
  const [scene] = useState(() => new THREE.Scene());

  const { 
    scale, 
    ior, 
    thickness, 
    anisotropy, 
    chromaticAberration, 
    transmission, 
    roughness, 
    ...extraMat 
  } = modeProps as {
    scale?: number;
    ior?: number;
    thickness?: number;
    anisotropy?: number;
    chromaticAberration?: number;
    transmission?: number;
    roughness?: number;
    [key: string]: unknown;
  };

  useFrame((state, delta) => {
    const { gl, camera } = state;
    if (mode === 'lens' || mode === 'cube') {
      const { pointer, viewport: vp } = state;
      const v = vp.getCurrentViewport(camera, [0, 0, 15]);
      const destX = (pointer.x * v.width) / 2;
      const destY = (pointer.y * v.height) / 2;
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  // For navbar background mode, we want a full-width glass slab that covers the navbar completely
  const finalScale = mode === 'bar' ? 1.0 : (scale ?? 1.5);

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent opacity={0.3} />
      </mesh>
      <mesh
        ref={ref}
        scale={finalScale}
        rotation-x={mode === 'bar' ? 0 : Math.PI / 4}
        rotation-y={mode === 'bar' ? 0 : Math.PI / 4}
      >
        {mode === 'bar' ? (
          <boxGeometry args={[viewport.width * 3, viewport.height * 2.5, 1.5]} />
        ) : mode === 'cube' ? (
          <boxGeometry args={[2, 2, 2]} />
        ) : (
          <sphereGeometry args={[2.2, 32, 32]} />
        )}
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 2}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.05}
          transmission={transmission ?? 1}
          roughness={roughness ?? 0}
          {...(typeof extraMat === 'object' && extraMat !== null ? extraMat : {})}
        />
      </mesh>
    </>
  );
}

function BackgroundLights() {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref1.current) {
      ref1.current.position.x = Math.sin(t * 1.5) * 3;
      ref1.current.position.y = Math.cos(t * 1.2) * 1.5;
    }
    if (ref2.current) {
      ref2.current.position.x = Math.cos(t * 1.1) * 3;
      ref2.current.position.y = Math.sin(t * 1.4) * 1.5;
    }
  });

  return (
    <>
      <mesh ref={ref1} position={[0, 0, -5]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#2596BE" />
      </mesh>
      <mesh ref={ref2} position={[0, 0, -5]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#FDD026" />
      </mesh>
    </>
  );
}

export default function FluidGlass({ 
  mode = 'lens', 
  lensProps = {}, 
  barProps = {}, 
  cubeProps = {},
  scale,
  ior,
  thickness,
  thinkness,
  transmission,
  roughness,
  chromaticAberration,
  chormaticAberration,
  anisotropy,
  isNavbarBg = true
}: FluidGlassProps) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const activeThickness = thickness !== undefined ? thickness : thinkness;
  const activeChromatic = chromaticAberration !== undefined ? chromaticAberration : chormaticAberration;

  const mergedModeProps = {
    ...rawOverrides,
    ...(scale !== undefined && { scale }),
    ...(ior !== undefined && { ior }),
    ...(activeThickness !== undefined && { thickness: activeThickness }),
    ...(transmission !== undefined && { transmission }),
    ...(roughness !== undefined && { roughness }),
    ...(activeChromatic !== undefined && { chromaticAberration: activeChromatic }),
    ...(anisotropy !== undefined && { anisotropy }),
  };

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = mergedModeProps as any;

  if (isNavbarBg) {
    return (
      <div className="absolute inset-0 -z-10 rounded-full overflow-hidden pointer-events-none">
        <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <CanvasErrorBoundary fallback={<FallbackMesh mode={mode} modeProps={modeProps} />}>
            <Suspense fallback={<FallbackMesh mode={mode} modeProps={modeProps} />}>
              <Wrapper modeProps={modeProps}>
                <BackgroundLights />
              </Wrapper>
            </Suspense>
          </CanvasErrorBoundary>
        </Canvas>
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems as NavItem[]} />}
        <CanvasErrorBoundary fallback={<FallbackMesh mode={mode} modeProps={modeProps} />}>
          <Suspense fallback={null}>
            <Wrapper modeProps={modeProps}>
              <Scroll>
                <Typography />
                <Images />
              </Scroll>
              <Scroll html />
              <Preload />
            </Wrapper>
          </Suspense>
        </CanvasErrorBoundary>
      </ScrollControls>
    </Canvas>
  );
}

type MeshProps = ThreeElements['mesh'];

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
}

interface ZoomMaterial extends THREE.Material {
  zoom: number;
}

interface ZoomMesh extends THREE.Mesh<THREE.BufferGeometry, ZoomMaterial> { }

type ZoomGroup = THREE.Group & { children: ZoomMesh[] };

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState<THREE.Scene>(() => new THREE.Scene());
  const geoWidthRef = useRef<number>(1);

  useEffect(() => {
    const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if ((modeProps as { scale?: number }).scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x5227ff, 1);
  });

  const { 
    scale, 
    ior, 
    thickness, 
    anisotropy, 
    chromaticAberration, 
    transmission, 
    roughness, 
    ...extraMat 
  } = modeProps as {
    scale?: number;
    ior?: number;
    thickness?: number;
    anisotropy?: number;
    chromaticAberration?: number;
    transmission?: number;
    roughness?: number;
    [key: string]: unknown;
  };

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={(nodes[geometryKey] as THREE.Mesh)?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          transmission={transmission ?? 1}
          roughness={roughness ?? 0}
          {...(typeof extraMat === 'object' && extraMat !== null ? extraMat : {})}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps } & MeshProps) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }: { items: NavItem[] }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.045 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.045 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link) return;
    link.startsWith('#') ? (window.location.hash = link) : (window.location.href = link);
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          renderOrder={10}
          onClick={e => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef<ZoomGroup>(null!);
  const data = useScroll();
  const { height } = useThree(s => s.viewport);

  useFrame(() => {
    group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    group.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    group.current.children[4].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1]} url="/assets/demo/cs1.webp" />
      <Image position={[2, 0, 3]} scale={3} url="/assets/demo/cs2.webp" />
      <Image position={[-2.05, -height, 6]} scale={[1, 3]} url="/assets/demo/cs3.webp" />
      <Image position={[-0.6, -height, 9]} scale={[1, 2]} url="/assets/demo/cs1.webp" />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url="/assets/demo/cs2.webp" />
    </group>
  );
}

function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      React Bits
    </Text>
  );
}
