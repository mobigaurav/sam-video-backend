FROM amazonlinux:2

# Install dependencies
RUN yum -y update && \
    yum -y install autoconf automake bzip2 bzip2-devel cmake gcc gcc-c++ git libtool make nasm pkgconfig zlib-devel zip

# Build FFmpeg
RUN cd /opt && \
    git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg && \
    mkdir -p /opt/ffmpeg-layer/bin && \
    cd ffmpeg && \
    ./configure --prefix=/opt/ffmpeg-layer/bin --disable-doc --disable-x86asm && \
    make -j$(nproc) && \
    make install

# Package it
RUN cd /opt/ffmpeg-layer && zip -r ffmpeg-layer.zip .
