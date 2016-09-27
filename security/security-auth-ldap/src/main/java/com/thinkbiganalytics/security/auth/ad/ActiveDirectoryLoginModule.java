/**
 * 
 */
package com.thinkbiganalytics.security.auth.ad;

import java.security.Principal;
import java.util.Map;

import javax.security.auth.Subject;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.login.AccountException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.ldap.authentication.AbstractLdapAuthenticationProvider;

import com.thinkbiganalytics.auth.jaas.AbstractLoginModule;
import com.thinkbiganalytics.security.UsernamePrincipal;

/**
 *
 * @author Sean Felten
 */
public class ActiveDirectoryLoginModule extends AbstractLoginModule {
    
    private static final Logger log = LoggerFactory.getLogger(ActiveDirectoryLoginModule.class);

    public static final String AUTH_PROVIDER = "authProvider";
    
    private AbstractLdapAuthenticationProvider authProvider;
    
    
    /* (non-Javadoc)
     * @see com.thinkbiganalytics.auth.jaas.AbstractLoginModule#initialize(javax.security.auth.Subject, javax.security.auth.callback.CallbackHandler, java.util.Map, java.util.Map)
     */
    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState, Map<String, ?> options) {
        super.initialize(subject, callbackHandler, sharedState, options);
        
        this.authProvider = (AbstractLdapAuthenticationProvider) getOption(AUTH_PROVIDER)
                        .orElseThrow(() -> new IllegalArgumentException("The \"" + AUTH_PROVIDER + "\" option is required"));
    }

    /* (non-Javadoc)
     * @see com.thinkbiganalytics.auth.jaas.AbstractLoginModule#doLogin()
     */
    @Override
    protected boolean doLogin() throws Exception {
        final NameCallback nameCallback = new NameCallback("Username: ");
        final PasswordCallback passwordCallback = new PasswordCallback("Password: ", false);

        handle(nameCallback, passwordCallback);
        
        if (nameCallback.getName() == null) {
            throw new AccountException("No username provided for authentication");
        }
        
        Principal userPrincipal = new UsernamePrincipal(nameCallback.getName());
        String password = new String(passwordCallback.getPassword());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userPrincipal, password);

        log.debug("Authenticating: {}", userPrincipal);
        Authentication authenticated = this.authProvider.authenticate(authentication);
        log.debug("Successfully Authenticated: {}", userPrincipal);
        
        setUserPrincipal(userPrincipal);

        for (GrantedAuthority grant : authenticated.getAuthorities()) {
            String groupName = grant.getAuthority();

            log.debug("Found group for {}: {}", userPrincipal, groupName);
            
            if (groupName != null) {
                addNewGroupPrincipal(groupName);
            }
        }
        
        return true;
    }

    /* (non-Javadoc)
     * @see com.thinkbiganalytics.auth.jaas.AbstractLoginModule#doCommit()
     */
    @Override
    protected boolean doCommit() throws Exception {
        getSubject().getPrincipals().addAll(getPrincipals());
        return true;
    }

    /* (non-Javadoc)
     * @see com.thinkbiganalytics.auth.jaas.AbstractLoginModule#doAbort()
     */
    @Override
    protected boolean doAbort() throws Exception {
        return doLogout();
    }

    /* (non-Javadoc)
     * @see com.thinkbiganalytics.auth.jaas.AbstractLoginModule#doLogout()
     */
    @Override
    protected boolean doLogout() throws Exception {
        getSubject().getPrincipals().removeAll(getPrincipals());
        return true;
    }

}
