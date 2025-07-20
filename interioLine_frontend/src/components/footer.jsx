import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#EEE2D0',
            padding: '60px 20px 30px 20px',
            textAlign: 'center',
            borderTop: '1px solid #E8E0D4',
            marginTop: '40px',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>


                {/* Company Name */}
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#C2805A',
                    marginBottom: '15px',
                    letterSpacing: '1px',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    INTERIO-LINE
                </h2>

                {/* Tagline */}
                <p style={{
                    fontSize: '16px',
                    color: '#8B6F47',
                    marginBottom: '40px',
                    maxWidth: '600px',
                    margin: '0 auto 40px auto',
                    lineHeight: '1.5'
                }}>
                    High level experience in web design and development knowledge, producing quality work.
                </p>

                {/* Social Media Icons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <a
                        href="#"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '45px',
                            height: '45px',
                            border: '2px solid #C2805A',
                            borderRadius: '8px',
                            color: '#C2805A',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#C2805A';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#C2805A';
                        }}
                    >
                        <FaFacebookF style={{ fontSize: '18px' }} />
                    </a>

                    <a
                        href="#"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '45px',
                            height: '45px',
                            border: '2px solid #C2805A',
                            borderRadius: '8px',
                            color: '#C2805A',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#C2805A';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#C2805A';
                        }}
                    >
                        <FaInstagram style={{ fontSize: '18px' }} />
                    </a>

                    <a
                        href="#"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '45px',
                            height: '45px',
                            border: '2px solid #C2805A',
                            borderRadius: '8px',
                            color: '#C2805A',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#C2805A';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#C2805A';
                        }}
                    >
                        <FaYoutube style={{ fontSize: '18px' }} />
                    </a>

                    <a
                        href="#"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '45px',
                            height: '45px',
                            border: '2px solid #C2805A',
                            borderRadius: '8px',
                            color: '#C2805A',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#C2805A';
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#C2805A';
                        }}
                    >
                        <FaLinkedinIn style={{ fontSize: '18px' }} />
                    </a>
                </div>

                {/* Copyright */}
                <div style={{
                    borderTop: '1px solid #D4C4B0',
                    paddingTop: '20px'
                }}>
                    <p style={{
                        fontSize: '14px',
                        color: '#8B6F47',
                        margin: '0'
                    }}>
                        © 2025 All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;